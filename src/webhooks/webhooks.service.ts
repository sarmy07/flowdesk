/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PaymentStatus } from 'src/common/enums/payment.status.enum';
import { PaymentService } from 'src/payment/payment.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { createHmac } from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionsService,
  ) {}

  async handlePaystackWebhook(body: any, signature: string, rawBody: Buffer) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY!;

    const expectedSignature = createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    // console.log('EXPECTED SIGNATURE:', expectedSignature);
    // console.log('RECEIVED:', signature);

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    // console.log('PAYSTACK SIGNATURE:', signature);
    const event = body.event;
    const reference = body.data.reference;

    if (event === 'charge.success') {
      const payment = await this.paymentService.findByReference(reference);

      if (payment.status === PaymentStatus.SUCCESS) {
        return {
          message: 'Payment already processed!',
        };
      }

      const newSub = await this.subscriptionService.create({
        organizationId: payment.organizationId,
        planId: payment.planId,
      });

      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();
      payment.subscriptionId = newSub.id;

      await this.paymentService.updatePayment(payment);
      // console.log('process payment:', payment);
    } else {
      // console.log('ignore event');
    }

    return {
      message: 'Webhook processed',
    };
  }
}
