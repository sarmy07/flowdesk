import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUsageDto } from './dto/update-usage.dto';
import { Repository } from 'typeorm';
import { Usage } from './entities/usage.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationsService } from 'src/organizations/organizations.service';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Usage)
    private readonly usageRepo: Repository<Usage>,

    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationService: OrganizationsService,
  ) {}
  async create(organizationId: string, members: number) {
    const organization = await this.organizationService.findOne(organizationId);
    const usage = this.usageRepo.create({
      organizationId,
      members,
    });

    return await this.usageRepo.save(usage);
  }

  async getUsage(organizationId: string) {
    const usage = await this.usageRepo.findOne({
      where: {
        organizationId,
      },
    });
    if (!usage) throw new NotFoundException();

    return usage;
  }

  async incrementMembers(organizationId: string) {
    const usage = await this.findOne(organizationId);
    if (!usage) throw new NotFoundException('Usage not found');

    usage.members += 1;

    return await this.usageRepo.save(usage);
  }

  async decrementMembers(organizationId: string) {
    const usage = await this.findOne(organizationId);
    if (!usage) throw new NotFoundException();

    usage.members -= 1;

    return await this.usageRepo.save(usage);
  }

  findAll() {
    return `This action returns all usage`;
  }

  async findOne(organizationId: string) {
    return await this.usageRepo.findOne({
      where: {
        organizationId,
      },
    });
  }

  update(id: number, updateUsageDto: UpdateUsageDto) {
    return `This action updates a #${id} usage`;
  }

  remove(id: number) {
    return `This action removes a #${id} usage`;
  }
}
