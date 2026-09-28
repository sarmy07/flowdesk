import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  planId: string;
}
