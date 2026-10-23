import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  organizationId: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  @Column()
  action: string;

  @Column({
    type: 'jsonb',
    default: {},
  })
  details: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
