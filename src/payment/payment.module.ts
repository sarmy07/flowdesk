import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { PlansModule } from 'src/plans/plans.module';
import { HttpModule } from '@nestjs/axios';
import { PaystackService } from './paystack/paystack.service';
import { ConfigModule } from '@nestjs/config';
import paystackConfig from './paystack/config/paystack.config';
import { MembershipsModule } from 'src/memberships/memberships.module';

@Module({
  imports: [
    ConfigModule.forFeature(paystackConfig),
    TypeOrmModule.forFeature([Payment]),
    SubscriptionsModule,
    OrganizationsModule,
    PlansModule,
    HttpModule,
    MembershipsModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaystackService],
  exports: [PaymentService],
})
export class PaymentModule {}
