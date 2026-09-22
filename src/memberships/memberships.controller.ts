import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { CurrentUser } from 'src/auth/decorators/current.user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AddMemberDto } from './dto/add-member.dto';

@ApiBearerAuth()
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('organizations/:organizationId/members')
  @ApiOperation({ summary: 'add member' })
  addMember(
    @Body() dto: AddMemberDto,
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.AddMember(dto, organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations/:organizationId/members')
  @ApiOperation({ summary: 'find all organization members' })
  findAllByOrganization(@Param('organizationId') organizationId: string) {
    return this.membershipsService.findAllByOrganization(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations/:organizationId/members/me')
  @ApiOperation({ summary: 'find membership' })
  findOne(
    @CurrentUser() user: User,
    @Param('organizationId') organizationId: string,
  ) {
    return this.membershipsService.findOne(user.id, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('organizations/:organizationId/members/:userId/role')
  @ApiOperation({ summary: 'update member role' })
  update(
    @Param('userId') userId: string,
    @Param('organizationId') organizationId: string,
    @Body()
    updateMembershipDto: UpdateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.updateMemberRole(
      userId,
      organizationId,
      updateMembershipDto,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('organizations/:organizationId/members/:userId')
  @ApiOperation({ summary: 'remove member from organization' })
  remove(
    @Param('userId') userId: string,
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.remove(userId, organizationId, user.id);
  }
}
