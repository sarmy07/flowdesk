import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import { IsInt, Min } from 'class-validator';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @IsInt()
  @Min(1)
  version: number;
}
