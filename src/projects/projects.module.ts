import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { MembershipsModule } from 'src/memberships/memberships.module';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    OrganizationsModule,
    MembershipsModule,
    UsageModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
