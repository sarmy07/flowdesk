import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { PaymentStatus } from 'src/common/enums/payment.status.enum';
import { randomUUID } from 'crypto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { PlansService } from 'src/plans/plans.service';
import { PaystackService } from './paystack/paystack.service';
import { MembershipsService } from 'src/memberships/memberships.service';
import { SubscriptionStatus } from 'src/common/enums/subscription.status.enum';
import { BillingInterval } from 'src/common/enums/billing.interval.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly organizationService: OrganizationsService,
    private readonly planService: PlansService,
    private readonly subscriptionService: SubscriptionsService,
    private readonly memebershipService: MembershipsService,

    private readonly paystackService: PaystackService,
  ) {}

  async create(dto: CreatePaymentDto) {
    const organization = await this.organizationService.findOne(
      dto.organizationId,
    );
    if (!organization) throw new NotFoundException();

    const plan = await this.planService.findOne(dto.planId);
    if (!plan) throw new NotFoundException();

    if (!plan.isActive) throw new BadRequestException('plan is not active');

    const existingSub = await this.subscriptionService.findActiveByOrganization(
      organization.id,
    );

    if (existingSub) {
      throw new ConflictException(
        'Organization already has an active subscription',
      );
    }

    const amount = plan.price;
    const reference = `FLOWDESK-${randomUUID()}`;
    const owner = await this.memebershipService.findOrganizationByOwner(
      dto.organizationId,
    );
    if (!owner) {
      throw new NotFoundException('Organization owner not found');
    }
    const email = owner?.user.email;

    const payment = this.paymentRepo.create({
      organizationId: dto.organizationId,
      planId: dto.planId,
      subscriptionId: null,
      amount,
      status: PaymentStatus.PENDING,
      reference,
      paidAt: null,
    });

    await this.paymentRepo.save(payment);
    try {
      const paystackResponse = await this.paystackService.initializeTransaction(
        email,
        amount,
        reference,
      );

      return {
        payment,
        authorizationUrl: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
      };
    } catch (error) {
      payment.status = PaymentStatus.FAILED;

      await this.paymentRepo.save(payment);

      throw error;
    }
  }

  async verifyPayment(reference: string) {
    const payment = await this.paymentRepo.findOne({
      where: {
        reference,
      },
    });
    if (!payment) throw new NotFoundException();

    try {
      const paystackVerify =
        await this.paystackService.verifyTransaction(reference);

      console.log('PAYSTACK VERIFY:', paystackVerify);

      if (paystackVerify.data.status !== 'success') {
        payment.status = PaymentStatus.FAILED;
        await this.paymentRepo.save(payment);

        return {
          message: 'Payment was not successful',
          payment,
        };
      }

      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();

      const newSubscription = await this.subscriptionService.create({
        organizationId: payment.organizationId,
        planId: payment.planId,
      });

      payment.subscriptionId = newSubscription.id;

      await this.paymentRepo.save(payment);

      return {
        message: 'Payment verified successfully',
        payment,
        subscription: newSubscription,
      };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all payment`;
  }

  async findByReference(reference: string) {
    const payment = await this.paymentRepo.findOne({
      where: {
        reference,
      },
    });
    if (!payment) {
      throw new NotFoundException();
    }
    return payment;
  }

  async updatePayment(payment: Payment) {
    return await this.paymentRepo.save(payment);
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
