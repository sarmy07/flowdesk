import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifcations.processor/notifcations.processor';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
