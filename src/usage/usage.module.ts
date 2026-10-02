import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usage } from './entities/usage.entity';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usage]), OrganizationsModule],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
