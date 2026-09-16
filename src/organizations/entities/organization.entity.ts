import { Membership } from 'src/memberships/entities/membership.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
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

  @CreateDateColumn()
  createdAt: Date;
}
