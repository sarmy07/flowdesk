import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { PlansService } from 'src/plans/plans.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { SubscriptionStatus } from 'src/common/enums/subscription.status.enum';
import { BillingInterval } from 'src/common/enums/billing.interval.enum';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subcriptionRepo: Repository<Subscription>,

    private readonly planService: PlansService,
    private readonly organizationService: OrganizationsService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const organization = await this.organizationService.findOne(
      dto.organizationId,
    );
    if (!organization) throw new NotFoundException();

    const plan = await this.planService.findOne(dto.planId);
    if (!plan) throw new NotFoundException();

    if (!plan.isActive) {
      throw new ConflictException('plan is no longer active');
    }

    const existingSub = await this.subcriptionRepo.findOne({
      where: {
        organizationId: dto.organizationId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
    if (existingSub) {
      throw new ConflictException();
    }

    // calculate sub dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (plan.billingInterval === BillingInterval.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    if (plan.billingInterval === BillingInterval.YEARLY) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = this.subcriptionRepo.create({
      organizationId: dto.organizationId,
      planId: dto.planId,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
    });

    return await this.subcriptionRepo.save(subscription);
  }

  async findAllSubcriptionsForOrganization(organizationId: string) {
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) throw new NotFoundException();

    return await this.subcriptionRepo.find({
      where: {
        organizationId: organization.id,
      },
      relations: {
        plan: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const subscription = await this.subcriptionRepo.findOne({
      where: {
        id,
      },
      relations: {
        plan: true,
        organization: true,
      },
    });

    if (!subscription) throw new NotFoundException();
    return subscription;
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.findOne(subscriptionId);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new ConflictException('Subscription is already cancelled');
    }

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new ConflictException('Expired subscription cannot be cancelled');
    }

    subscription.status = SubscriptionStatus.CANCELLED;

    return await this.subcriptionRepo.save(subscription);
  }

  async renewSubscription(subcriptionId: string) {
    const subscription = await this.subcriptionRepo.findOne({
      where: {
        id: subcriptionId,
      },
      relations: {
        plan: true,
      },
    });

    if (!subscription) throw new NotFoundException();

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ConflictException('Only active subcriptions can be renewed');
    }

    if (subscription.plan.billingInterval === BillingInterval.MONTHLY) {
      subscription.endDate.setMonth(subscription.endDate.getMonth() + 1);
    }

    if (subscription.plan.billingInterval === BillingInterval.YEARLY) {
      subscription.endDate.setFullYear(subscription.endDate.getFullYear() + 1);
    }

    return await this.subcriptionRepo.save(subscription);
  }
}
