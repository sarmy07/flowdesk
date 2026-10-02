import { Membership } from 'src/memberships/entities/membership.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { Usage } from 'src/usage/entities/usage.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  name: string;

  @OneToMany(() => Membership, (m) => m.organization)
  memberships: Membership[];

  @OneToMany(() => Subscription, (s) => s.organization)
  subscriptions: Subscription[];

  @OneToOne(() => Usage, (u) => u.organization)
  usage: Usage;

  @CreateDateColumn()
  createdAt: Date;
}
