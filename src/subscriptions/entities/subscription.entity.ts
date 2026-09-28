import { SubscriptionStatus } from 'src/common/enums/subscription.status.enum';
import { Organization } from 'src/organizations/entities/organization.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  planId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToOne(() => Organization, (o) => o.subscriptions)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Plan, (p) => p.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @OneToMany(() => Payment, (p) => p.subscription)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
