import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto) {
    const planExists = await this.findPlanByName(dto.name);
    if (planExists) throw new ConflictException('plan already exists');

    const plan = this.planRepo.create(dto);
    return await this.planRepo.save(plan);
  }

  async findAll() {
    return await this.planRepo.find({
      where: {
        isActive: true,
      },
    });
  }

  async findOne(id: string) {
    const plan = await this.planRepo.findOne({
      where: {
        id,
      },
    });

    if (!plan) throw new NotFoundException();
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findOne(id);

    if (dto.name) {
      const nameExists = await this.findPlanByName(dto.name);

      if (nameExists && nameExists.id !== plan.id) {
        throw new ConflictException('name already exists');
      }
    }

    Object.assign(plan, dto);

    return await this.planRepo.save(plan);
  }

  async remove(id: string) {
    const plan = await this.findOne(id);

    plan.isActive = false;
    return this.planRepo.remove(plan);
  }

  async findPlanByName(name: string) {
    const plan = await this.planRepo.findOne({
      where: {
        name,
      },
    });

    if (!plan) throw new NotFoundException();
    return plan;
  }
}
