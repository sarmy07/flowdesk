/*
https://docs.nestjs.com/providers#services
*/

import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionStatus } from 'src/common/enums/subscription.status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubcriptionExpirationService {
  private readonly logger = new Logger(SubcriptionExpirationService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async subExpiration() {
    const expiredSubscriptions = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(new Date()),
      },
    });

    if (expiredSubscriptions.length === 0) {
      this.logger.log('No subscription to expire');
    }

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
    }

    await this.subscriptionRepo.save(expiredSubscriptions);

    this.logger.log(`${expiredSubscriptions.length} subscription expired`);
  }
}
