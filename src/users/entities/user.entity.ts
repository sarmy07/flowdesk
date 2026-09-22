import { Membership } from 'src/memberships/entities/membership.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Membership, (m) => m.user)
  memberships: Membership[];

  @Column({
    type: 'varchar',
    nullable: true,
  })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;
}
