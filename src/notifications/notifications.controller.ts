/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test-invitation')
  async testInvitation() {
    await this.notificationsService.queueInvitationEmail(
      'test@gmail.com',
      'acme-tech',
    );

    return {
      message: 'Invitation job added to the queue',
    };
  }
}
