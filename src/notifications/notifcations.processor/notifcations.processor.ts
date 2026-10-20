import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === 'invitation-email') {
      const { email, organizationName } = job.data;

      console.log(`Invitation for ${email} to join ${organizationName}`);
    } else if (job.name === 'payment-confirmation') {
      const { email, amount } = job.data;

      console.log(`Payment confirmation for ${email}: ${amount}`);
    } else {
      throw new Error(`Unknown notification job: ${job.name}`);
    }
  }

  //   async process(job: Job): Promise<void> {
  //   if (job.name === 'invitation-email') {
  //     const { email, organizationName } = job.data;

  //     console.log(`Invitation sent to ${email} for ${organizationName}`);
  //   } else if (job.name === 'payment-confirmation') {
  //     const { email, amount } = job.data;

  //     console.log(`Payment confirmation for ${email}: ${amount}`);
  //   } else if (job.name === 'subscription-expiry') {
  //     const { email, organizationName } = job.data;

  //     console.log(`Subscription expiry reminder for ${organizationName} sent to ${email}`);
  //   } else {
  //     throw new Error(`Unknown notification job: ${job.name}`);
  //   }
  // }
}
