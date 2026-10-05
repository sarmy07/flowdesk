import { Role } from 'src/common/enums/user.role.enum';
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

  @Column({
    nullable: true,
  })
  username: string;

  @OneToMany(() => Membership, (m) => m.user)
  memberships: Membership[];

  @Column({
    type: 'varchar',
    nullable: true,
  })
  refreshToken: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;
}
