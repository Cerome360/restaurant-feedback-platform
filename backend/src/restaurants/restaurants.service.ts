import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug: slug.toLowerCase() },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        phone: true,
        retentionOffer: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async getOwnerRestaurants(userId: string) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { feedbacks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate quick stats for each
    const results = await Promise.all(
      restaurants.map(async (r) => {
        const stats = await this.prisma.feedback.aggregate({
          where: { restaurantId: r.id },
          _avg: { rating: true },
        });

        return {
          ...r,
          totalFeedbacks: r._count.feedbacks,
          averageRating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
        };
      }),
    );

    return results;
  }

  async getById(id: string, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { feedbacks: true },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    const stats = await this.prisma.feedback.aggregate({
      where: { restaurantId: id },
      _avg: { rating: true },
    });

    return {
      ...restaurant,
      totalFeedbacks: restaurant._count.feedbacks,
      averageRating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
    };
  }

  async create(userId: string, dto: CreateRestaurantDto) {
    let slug = dto.slug;
    if (!slug) {
      const baseSlug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${baseSlug}-${suffix}`;
    }

    const existingSlug = await this.prisma.restaurant.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException('A restaurant with this slug already exists');
    }

    return this.prisma.restaurant.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        address: dto.address,
        phone: dto.phone,
        retentionOffer: dto.retentionOffer || 'Thank you for your feedback! Enjoy 10% off your next visit.',
        ownerId: userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateRestaurantDto) {
    await this.getById(id, userId);

    if (dto.slug) {
      const existing = await this.prisma.restaurant.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('This slug is already in use');
      }
    }

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async generateQrCode(id: string, userId: string, tableNumber?: string) {
    const restaurant = await this.getById(id, userId);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    let feedbackUrl = `${frontendUrl}/r/${restaurant.slug}`;
    if (tableNumber) {
      feedbackUrl += `?table=${encodeURIComponent(tableNumber)}`;
    }

    // Generate QR code data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(feedbackUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    // Also generate SVG string for crisp printing
    const qrSvg = await QRCode.toString(feedbackUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      slug: restaurant.slug,
      tableNumber: tableNumber || null,
      feedbackUrl,
      qrDataUrl,
      qrSvg,
    };
  }
}
