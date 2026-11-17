import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FeedbackService } from './feedback.service';
import {
  SubmitFeedbackDto,
  FeedbackFilterDto,
  UpdateStatusDto,
  submitFeedbackSchema,
  feedbackFilterSchema,
  updateStatusSchema,
} from './dto/feedback.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('submit')
  async submitFeedback(
    @Body(new ZodValidationPipe(submitFeedbackSchema)) dto: SubmitFeedbackDto,
    @Req() req: Request,
  ) {
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';
    return this.feedbackService.submitFeedback(dto, clientIp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('restaurant/:restaurantId')
  async getRestaurantFeedback(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(feedbackFilterSchema)) query: FeedbackFilterDto,
  ) {
    return this.feedbackService.getRestaurantFeedback(restaurantId, user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('restaurant/:restaurantId/stats')
  async getFeedbackStats(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.feedbackService.getFeedbackStats(restaurantId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(updateStatusSchema)) dto: UpdateStatusDto,
  ) {
    return this.feedbackService.updateFeedbackStatus(id, user.id, dto);
  }
}
