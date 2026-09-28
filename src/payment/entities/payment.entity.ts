import { PaymentStatus } from 'src/common/enums/payment.status.enum';
import { Plan } from 'src/plans/entities/plan.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  subscriptionId: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column()
  organizationId: string;

  @Column()
  planId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column()
  reference: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  paidAt: Date | null;

  @ManyToOne(() => Plan, (p) => p.payments)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @ManyToOne(() => Subscription, (s) => s.payments, { nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
