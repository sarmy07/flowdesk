import { IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  organizationId: string;

  @IsUUID()
  planId: string;
}
