import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { Membership } from 'src/memberships/entities/membership.entity';
import { OrganizationRole } from 'src/common/enums/organization-role.enum';
import { UsersService } from 'src/users/users.service';
import { UsageService } from 'src/usage/usage.service';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { Role } from 'src/common/enums/user.role.enum';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,

    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,

    private readonly userService: UsersService,

    private readonly auditLogService: AuditLogsService,

    @Inject(forwardRef(() => UsageService))
    private readonly usageService: UsageService,
  ) {}

  async create(dto: CreateOrganizationDto, userId: string) {
    const exists = await this.findByName(dto.name);
    if (exists) {
      throw new ConflictException('name already exits');
    }

    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException();

    const organization = this.organizationRepo.create({
      name: dto.name,
    });

    const savedOrganization = await this.organizationRepo.save(organization);

    const membership = this.membershipRepo.create({
      organizationId: savedOrganization.id,
      userId: user.id,
      role: OrganizationRole.OWNER,
    });
    await this.membershipRepo.save(membership);

    await this.usageService.create(savedOrganization.id, 1);

    return savedOrganization;
  }

  async findAll(userId: string) {
    const memberships = await this.membershipRepo.find({
      where: {
        userId,
      },
      relations: {
        organization: true,
      },
    });

    return memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
      createdAt: membership.organization.createdAt,
    }));
  }

  async findOne(id: string) {
    const organization = await this.organizationRepo.findOne({
      where: {
        id,
      },
      relations: {
        memberships: true,
      },
    });

    if (!organization) throw new NotFoundException('organization not found');

    return organization;
  }

  async findByName(name: string) {
    return await this.organizationRepo.findOne({
      where: {
        name,
      },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto, userId: string) {
    const organization = await this.findOne(id);
    const oldNameOfOrganization = organization.name;
    const membership = await this.membershipRepo.findOne({
      where: {
        userId,
        organizationId: id,
      },
    });

    if (!membership)
      throw new NotFoundException('you are not a member of this organization');

    if (
      membership.role !== OrganizationRole.OWNER &&
      membership.role !== OrganizationRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only The Organization Owner or Admin can perform this action',
      );
    }

    if (dto.name) {
      const existing = await this.findByName(dto.name);

      if (existing && existing.id !== organization.id) {
        throw new ConflictException('Organization name already exists');
      }
      organization.name = dto.name;
    }

    const nameChanged =
      dto.name !== undefined && dto.name !== oldNameOfOrganization;

    const updatedOrganization = await this.organizationRepo.save(organization);

    if (nameChanged) {
      await this.auditLogService.log({
        organizationId: organization.id,
        userId: userId,
        action: 'ORGANIZATION_UPDATED',
        details: {
          oldName: oldNameOfOrganization,
          newName: organization.name,
        },
      });
    }

    return updatedOrganization;
  }

  async remove(id: string, currentUserId: string) {
    const currentUser = await this.userService.findOne(currentUserId);
    if (!currentUser) throw new NotFoundException();

    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only platform admin can delete organization',
      );
    }

    const organization = await this.findOne(id);
    if (!organization) return null;

    const organizationId = organization.id;
    const organizationName = organization.name;

    await this.organizationRepo.remove(organization);

    await this.auditLogService.log({
      organizationId: null,
      userId: currentUserId,
      action: 'ORGANIZATION_REMOVED',
      details: {
        deletedOrganization: organizationId,
        organizationName,
      },
    });

    return {
      message: `Organization "${organizationName}" removed!`,
    };
  }
}
