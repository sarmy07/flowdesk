import { forwardRef, Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Membership } from 'src/memberships/entities/membership.entity';
import { UsersModule } from 'src/users/users.module';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Membership]),
    UsersModule,
    forwardRef(() => UsageModule),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
