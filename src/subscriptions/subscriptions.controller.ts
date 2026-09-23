import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get('organization/:organizationId')
  findAll(@Param('organizationId') organizationId: string) {
    return this.subscriptionsService.findAllSubcriptionsForOrganization(
      organizationId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancelSUbscription(@Param('subscriptionId') subscriptionId: string) {
    return this.subscriptionsService.cancelSubscription(subscriptionId);
  }

  @Patch(':id/renew')
  renewSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.subscriptionsService.renewSubscription(subscriptionId);
  }
}
