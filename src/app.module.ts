import { SubcriptionExpirationService } from './subscriptions/subcription-expiration.service';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PaystackService } from './payment/paystack/paystack.service';
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSourceOptions } from 'db/data-source';
import { UsersModule } from './users/users.module';
import { validation } from './config/validation.schema';
import { OrganizationsModule } from './organizations/organizations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentModule } from './payment/payment.module';
import { UsageModule } from './usage/usage.module';
import { ProjectsModule } from './projects/projects.module';
import authConfig from './auth/config/authConfig';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validation,
      load: [authConfig],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: Number(config.get<string>('REDIS_PORT', '6379')),
        },
      }),
    }),
    // BullModule.forRoot({
    //   connection: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          stores: [
            createKeyv(
              `redis://${config.get<string>('REDIS_HOST', 'localhost')}:${config.get<string>('REDIS_PORT', '6379')}`,
              // 'redis://redis:6379'
            ),
          ],
          ttl: 60_000,
        }),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MembershipsModule,
    PlansModule,
    SubscriptionsModule,
    PaymentModule,
    WebhooksModule,
    UsageModule,
    ProjectsModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
