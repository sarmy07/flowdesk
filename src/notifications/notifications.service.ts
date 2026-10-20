/*
https://docs.nestjs.com/providers#services
*/

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
  ) {}

  async queueInvitationEmail(email: string, organizationName: string) {
    return this.notificationsQueue.add(
      'invitation-email',
      {
        email,
        organizationName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async queuePayment(email: string, amount: number) {
    return this.notificationsQueue.add(
      'payment-confirmation',
      {
        email,
        amount,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }
}
