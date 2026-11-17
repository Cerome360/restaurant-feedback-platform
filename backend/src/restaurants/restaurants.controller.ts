import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  createRestaurantSchema,
  updateRestaurantSchema,
} from './dto/restaurant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Public()
  @Get('public/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.restaurantsService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyRestaurants(@CurrentUser() user: UserPayload) {
    return this.restaurantsService.getOwnerRestaurants(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.restaurantsService.getById(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createRestaurantSchema)) dto: CreateRestaurantDto,
  ) {
    return this.restaurantsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(updateRestaurantSchema)) dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/qr')
  async getQrCode(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Query('table') table?: string,
  ) {
    return this.restaurantsService.generateQrCode(id, user.id, table);
  }
}
