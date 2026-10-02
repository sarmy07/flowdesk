import { Organization } from 'src/organizations/entities/organization.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usage')
export class Usage {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  organizationId: string;

  @OneToOne(() => Organization, (o) => o.usage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ default: 0 })
  projects: number;

  @Column({ default: 0 })
  members: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
