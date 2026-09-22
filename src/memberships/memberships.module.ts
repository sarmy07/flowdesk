import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { UsersModule } from 'src/users/users.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership]),
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
