import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreatePlanDto) {
    const planExists = await this.findPlanByName(dto.name);
    if (planExists) throw new ConflictException('plan already exists');

    const plan = this.planRepo.create(dto);

    await this.cacheManager.del('plans:active');
    return await this.planRepo.save(plan);
  }

  async findAll() {
    const cached = await this.cacheManager.get<Plan[]>('plans:active');
    if (cached) {
      console.log('CACHE HIT');
      return cached;
    }
    console.log('CACHE MISSED');
    // if cached exists return data from redis. no PG query is necessary
    const plans = await this.planRepo.find({
      where: {
        isActive: true,
      },
    });

    await this.cacheManager.set('plans:active', plans, 60000);
    return plans;
  }

  async findOne(id: string) {
    const cacheKey = `plans:${id}`;
    const cachedPlan = await this.cacheManager.get<Plan>(cacheKey);

    if (cachedPlan) return cachedPlan;

    const plan = await this.planRepo.findOne({
      where: {
        id,
      },
    });

    if (!plan) throw new NotFoundException();
    await this.cacheManager.set(cacheKey, plan, 60000);
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findOne(id);

    if (dto.version !== plan.version) {
      throw new ConflictException(
        'plan has been updated by someone else. Please refresh and try again',
      );
    }

    if (dto.name) {
      const nameExists = await this.findPlanByName(dto.name);

      if (nameExists && nameExists.id !== plan.id) {
        throw new ConflictException('name already exists');
      }
    }

    const { version, ...updateData } = dto;
    Object.assign(plan, updateData);

    const updatedPlan = await this.planRepo.save(plan);

    await this.cacheManager.del('plans:active');
    await this.cacheManager.del(`plan${id}`);

    return updatedPlan;
  }

  async remove(id: string) {
    const plan = await this.findOne(id);

    plan.isActive = false;

    const updatedPlan = await this.planRepo.save(plan);
    await this.cacheManager.del('plans:active');
    return updatedPlan;
  }

  async isActiveInActive(planId: string) {
    const plan = await this.findOne(planId);

    plan.isActive = !plan.isActive;
    const updatedPlan = await this.planRepo.save(plan);
    await this.cacheManager.del('plans:active');
    await this.cacheManager.del(`plans:${planId}`);

    return updatedPlan;
  }

  async findPlanByName(name: string) {
    const plan = await this.planRepo.findOne({
      where: {
        name,
      },
    });

    return plan;
  }
}
