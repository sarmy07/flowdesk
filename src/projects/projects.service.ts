import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { MembershipsService } from 'src/memberships/memberships.service';
import { OrganizationRole } from 'src/common/enums/organization-role.enum';
import { UsageService } from 'src/usage/usage.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly organizationService: OrganizationsService,
    private readonly membershipService: MembershipsService,
    private readonly usageService: UsageService,
  ) {}

  async create(
    dto: CreateProjectDto,
    organizationId: string,
    currentUserId: string,
  ) {
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) throw new NotFoundException('orgnaization not found');

    const member = await this.membershipService.findOne(
      currentUserId,
      organization.id,
    );

    if (!member)
      throw new ForbiddenException('You are not a member of this organization');

    if (
      member.role !== OrganizationRole.ADMIN &&
      member.role !== OrganizationRole.OWNER
    ) {
      throw new UnauthorizedException(
        'Only Admin/Owner can perform this action',
      );
    }

    const project = this.projectRepo.create({
      ...dto,
      organizationId,
    });

    await this.usageService.incrementprojects(organization.id);
    await this.projectRepo.save(project);

    return project;
  }

  findAll() {
    return `This action returns all projects`;
  }

  async findAllProjectsByOrganization(organizationId: string) {
    return await this.projectRepo.find({
      where: {
        organizationId,
      },
      relations: {
        organization: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(projectId: string) {
    const project = await this.projectRepo.findOne({
      where: {
        id: projectId,
      },
      relations: {
        organization: true,
      },
    });
    if (!project) throw new NotFoundException();
    return project;
  }

  async update(
    projectId: string,
    dto: UpdateProjectDto,
    currentUserId: string,
  ) {
    const project = await this.findOne(projectId);
    if (!project) throw new NotFoundException('project not found');

    const organization = await this.organizationService.findOne(
      project.organizationId,
    );
    if (!organization) throw new NotFoundException();

    const isMember = await this.membershipService.findOne(
      currentUserId,
      organization.id,
    );
    if (!isMember)
      throw new NotFoundException('you are not a member of this organization');

    if (
      isMember.role !== OrganizationRole.ADMIN &&
      isMember.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException('only admin/owners can perfom this action');
    }

    Object.assign(project, dto);
    return await this.projectRepo.save(project);
  }

  async remove(projectId: string, currentUserId: string) {
    const project = await this.findOne(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const isMember = await this.membershipService.findOne(
      currentUserId,
      project.organizationId,
    );

    if (!isMember) throw new ForbiddenException();

    if (
      isMember.role !== OrganizationRole.ADMIN &&
      isMember.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException();
    }

    await this.projectRepo.remove(project);
    await this.usageService.decrementProjects(project.organizationId);

    return {
      message: 'project removed!',
    };
  }
}
