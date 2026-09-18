import {
  ConflictException,
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
    private readonly oraginzationRepo: Repository<Organization>,

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

    const organization = this.oraginzationRepo.create({
      name: dto.name,
    });

    const savedOrganization = await this.oraginzationRepo.save(organization);

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
        id: userId,
      },
      relations: {
        organization: true,
      },
    });

    return memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      createdAt: membership.organization.createdAt,
      role: membership.role,
    }));
  }

  async findOne(id: string) {
    return await this.oraginzationRepo.findOne({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return await this.oraginzationRepo.findOne({
      where: {
        name,
      },
    });
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
