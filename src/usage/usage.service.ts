import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsageDto } from './dto/create-usage.dto';
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
    private readonly organizationService: OrganizationsService,
  ) {}
  create(createUsageDto: CreateUsageDto) {
    return 'This action adds a new usage';
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

  findAll() {
    return `This action returns all usage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usage`;
  }

  update(id: number, updateUsageDto: UpdateUsageDto) {
    return `This action updates a #${id} usage`;
  }

  remove(id: number) {
    return `This action removes a #${id} usage`;
  }
}
