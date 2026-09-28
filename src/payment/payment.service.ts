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
      organization.id,
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

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
