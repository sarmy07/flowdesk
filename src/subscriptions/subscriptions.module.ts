import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { PlansModule } from 'src/plans/plans.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { SubcriptionExpirationService } from './subcription-expiration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    PlansModule,
    OrganizationsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubcriptionExpirationService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
