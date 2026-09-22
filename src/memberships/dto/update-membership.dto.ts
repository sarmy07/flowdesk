import { IsEnum } from 'class-validator';
import { OrganizationRole } from 'src/common/enums/organization-role.enum';

export class UpdateMembershipDto {
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}
