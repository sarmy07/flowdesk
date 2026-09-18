import {
  ConflictException,
  ForbiddenException,
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

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    private readonly userService: UsersService,
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

    const memebership = await this.membershipRepo.findOne({
      where: {
        userId,
        organizationId: id,
      },
    });

    if (!memebership)
      throw new NotFoundException('you are not a member of this organization');

    if (
      memebership.role !== OrganizationRole.OWNER &&
      memebership.role !== OrganizationRole.ADMIN
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

    return await this.organizationRepo.save(organization);
  }

  async remove(id: string) {
    const organization = await this.findOne(id);
    if (!organization) return null;

    return await this.organizationRepo.remove(organization);
  }
}
