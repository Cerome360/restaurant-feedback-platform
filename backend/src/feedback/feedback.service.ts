import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitFeedbackDto, FeedbackFilterDto, UpdateStatusDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private hashIp(ip?: string): string | null {
    if (!ip) return null;
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }

  async submitFeedback(dto: SubmitFeedbackDto, clientIp?: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug: dto.restaurantSlug.toLowerCase() },
      select: {
        id: true,
        name: true,
        retentionOffer: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Determine sentiment category based on rating
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    if (dto.rating >= 4) {
      sentiment = 'POSITIVE';
    } else if (dto.rating <= 2) {
      sentiment = 'NEGATIVE';
    }

    const ipHash = this.hashIp(clientIp);

    const feedback = await this.prisma.feedback.create({
      data: {
        restaurantId: restaurant.id,
        rating: dto.rating,
        positiveFeedback: dto.positiveFeedback?.trim() || null,
        improvementFeedback: dto.improvementFeedback?.trim() || null,
        customerName: dto.customerName?.trim() || null,
        customerPhone: dto.customerPhone?.trim() || null,
        tableNumber: dto.tableNumber?.trim() || null,
        sentiment,
        ipHash,
      },
    });

    return {
      success: true,
      id: feedback.id,
      restaurantName: restaurant.name,
      rating: feedback.rating,
      sentiment,
      retentionOffer: restaurant.retentionOffer,
      message: 'Thank you for your valuable feedback!',
    };
  }

  async verifyRestaurantAccess(restaurantId: string, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { ownerId: true, name: true, slug: true },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('Access denied to this restaurant data');
    }

    return restaurant;
  }

  async getRestaurantFeedback(restaurantId: string, userId: string, query: FeedbackFilterDto) {
    await this.verifyRestaurantAccess(restaurantId, userId);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      restaurantId,
    };

    if (query.sentiment && query.sentiment !== 'ALL') {
      where.sentiment = query.sentiment;
    }

    if (query.minRating || query.maxRating) {
      where.rating = {};
      if (query.minRating) where.rating.gte = query.minRating;
      if (query.maxRating) where.rating.lte = query.maxRating;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.hasContactInfo === true) {
      where.OR = [
        { customerPhone: { not: null } },
        { customerName: { not: null } },
      ];
    } else if (query.hasContactInfo === false) {
      where.customerPhone = null;
      where.customerName = null;
    }

    if (query.search) {
      const searchTerms = {
        contains: query.search,
        mode: 'insensitive' as const,
      };

      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { customerName: searchTerms },
            { customerPhone: searchTerms },
            { positiveFeedback: searchTerms },
            { improvementFeedback: searchTerms },
            { tableNumber: searchTerms },
          ],
        },
      ];
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items,
      pagination: {
        totalCount,
        page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getFeedbackStats(restaurantId: string, userId: string) {
    await this.verifyRestaurantAccess(restaurantId, userId);

    const [totalFeedbacks, avgResult, ratingsGroup, sentimentsGroup, leadsCount] =
      await Promise.all([
        this.prisma.feedback.count({ where: { restaurantId } }),
        this.prisma.feedback.aggregate({
          where: { restaurantId },
          _avg: { rating: true },
        }),
        this.prisma.feedback.groupBy({
          by: ['rating'],
          where: { restaurantId },
          _count: { rating: true },
        }),
        this.prisma.feedback.groupBy({
          by: ['sentiment'],
          where: { restaurantId },
          _count: { sentiment: true },
        }),
        this.prisma.feedback.count({
          where: {
            restaurantId,
            OR: [
              { customerPhone: { not: null } },
              { customerName: { not: null } },
            ],
          },
        }),
      ]);

    // Build star distribution map
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const group of ratingsGroup) {
      if (group.rating >= 1 && group.rating <= 5) {
        starCounts[group.rating as 1 | 2 | 3 | 4 | 5] = group._count.rating;
      }
    }

    // Build sentiment counts
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    for (const s of sentimentsGroup) {
      if (s.sentiment === 'POSITIVE') positiveCount = s._count.sentiment;
      if (s.sentiment === 'NEUTRAL') neutralCount = s._count.sentiment;
      if (s.sentiment === 'NEGATIVE') negativeCount = s._count.sentiment;
    }

    const averageRating = avgResult._avg.rating
      ? Number(avgResult._avg.rating.toFixed(2))
      : 0;

    const positiveRate =
      totalFeedbacks > 0
        ? Number(((positiveCount / totalFeedbacks) * 100).toFixed(1))
        : 0;

    const negativeRate =
      totalFeedbacks > 0
        ? Number(((negativeCount / totalFeedbacks) * 100).toFixed(1))
        : 0;

    const leadCaptureRate =
      totalFeedbacks > 0
        ? Number(((leadsCount / totalFeedbacks) * 100).toFixed(1))
        : 0;

    // Last 7 days breakdown
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentFeedbacks = await this.prisma.feedback.findMany({
      where: {
        restaurantId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        rating: true,
        sentiment: true,
        createdAt: true,
      },
    });

    const dailyActivity: Record<string, { date: string; count: number; avgRating: number; totalRating: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      dailyActivity[key] = { date: key, count: 0, avgRating: 0, totalRating: 0 };
    }

    for (const f of recentFeedbacks) {
      const key = f.createdAt.toISOString().split('T')[0];
      if (dailyActivity[key]) {
        dailyActivity[key].count += 1;
        dailyActivity[key].totalRating += f.rating;
      }
    }

    const timeline = Object.values(dailyActivity).map((day) => ({
      date: day.date,
      count: day.count,
      avgRating: day.count > 0 ? Number((day.totalRating / day.count).toFixed(1)) : 0,
    }));

    return {
      totalFeedbacks,
      averageRating,
      positiveCount,
      neutralCount,
      negativeCount,
      positiveRate,
      negativeRate,
      leadsCount,
      leadCaptureRate,
      starDistribution: starCounts,
      timeline,
    };
  }

  async updateFeedbackStatus(feedbackId: string, userId: string, dto: UpdateStatusDto) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        restaurant: {
          select: { ownerId: true },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (feedback.restaurant.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: dto.status },
    });
  }
}
