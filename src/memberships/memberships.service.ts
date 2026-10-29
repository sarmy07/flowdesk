import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { Repository } from 'typeorm';
import { AddMemberDto } from './dto/add-member.dto';
import { UsersService } from 'src/users/users.service';
import { OrganizationRole } from 'src/common/enums/organization-role.enum';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { UsageService } from 'src/usage/usage.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    private readonly organizationService: OrganizationsService,
    private readonly userService: UsersService,
    private readonly usageService: UsageService,
    private readonly notificationService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async addMember(
    dto: AddMemberDto,
    organizationId: string,
    currentUserId: string,
  ) {
    const user = await this.userService.findOne(dto.userId);
    if (!user) throw new NotFoundException();

    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) throw new NotFoundException();

    const currentMembership = await this.findOne(
      currentUserId,
      organization.id,
    );

    if (!currentMembership)
      throw new ForbiddenException('You are not a member of this organization');

    if (
      currentMembership.role !== OrganizationRole.ADMIN &&
      currentMembership.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException('Only admin or owner can add memeber');
    }

    const existingMembership = await this.findOne(dto.userId, organization.id);
    if (existingMembership) {
      throw new ConflictException('User already a member of this organization');
    }

    const membership = this.membershipRepo.create({
      userId: dto.userId,
      organizationId,
      role: OrganizationRole.MEMBER,
    });

    const savedMembership = await this.membershipRepo.save(membership);
    await this.usageService.incrementMembers(organization.id);

    await this.auditLogsService.log({
      organizationId: organization.id,
      userId: currentUserId,
      action: 'MEMBER_ADDED',
      details: {
        addedUserId: user.id,
        role: OrganizationRole.MEMBER,
      },
    });

    await this.notificationService.queueInvitationEmail(
      user.email,
      organization.name,
    );

    return savedMembership;
  }

  async findAllByOrganization(organizationId: string) {
    const memberships = await this.membershipRepo.find({
      where: {
        organizationId,
      },
      relations: {
        user: true,
      },
    });

    return memberships.map((m) => ({
      userId: m.user.id,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      email: m.user.email,
      role: m.role,
      name: m.organization.name,
      member: m.organization.memberships,
    }));
  }

  async findOrganizationByOwner(organizationId: string) {
    return await this.membershipRepo.findOne({
      where: {
        organizationId,
        role: OrganizationRole.OWNER,
      },
      relations: {
        user: true,
      },
    });
  }

  async findOne(userId: string, organizationId: string) {
    const membership = await this.membershipRepo.findOne({
      where: {
        userId,
        organizationId,
      },
      relations: {
        user: true,
      },
    });

    return membership;
  }

  async updateMemberRole(
    userId: string,
    organizationId: string,
    dto: UpdateMembershipDto,
    currentUserId: string,
  ) {
    const currentUser = await this.userService.findOne(currentUserId);
    if (!currentUser) throw new NotFoundException();

    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) throw new NotFoundException();

    const currentMembership = await this.findOne(
      currentUser.id,
      organization.id,
    );

    if (!currentMembership) {
      throw new ForbiddenException('you are not a member of this organization');
    }

    if (
      currentMembership.role !== OrganizationRole.ADMIN &&
      currentMembership.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException(
        'only the owner and admin can update role of memebers',
      );
    }

    const isUserMemeber = await this.findOne(userId, organization.id);
    if (!isUserMemeber) {
      throw new BadRequestException(
        'Only memebers of the organization can have their role updated.. check that the user parsed is a member.',
      );
    }

    const oldUserRole = isUserMemeber.role;

    if (
      dto.role === OrganizationRole.OWNER &&
      currentMembership.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException('only owner can assign the owner role');
    }

    if (
      isUserMemeber.role === OrganizationRole.OWNER &&
      dto.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException('the owner cannot be demoted');
    }

    const roleChanged = dto.role !== undefined && dto.role !== oldUserRole;

    if (dto.role === oldUserRole) {
      return isUserMemeber.role;
    }

    isUserMemeber.role = dto.role;

    const updatedUserRole = await this.membershipRepo.save(isUserMemeber);

    if (roleChanged) {
      await this.auditLogsService.log({
        organizationId: organizationId,
        userId: currentUserId,
        action: 'MEMBER_ROLE_UPDATED',
        details: {
          targetUserId: userId,
          oldRole: oldUserRole,
          newRole: updatedUserRole.role,
        },
      });
    }

    await this.notificationService.updateUserRole(
      isUserMemeber.user.email,
      updatedUserRole.role,
    );

    return updatedUserRole;
  }

  async remove(userId: string, organizationId: string, currentUserId: string) {
    const currentUser = await this.userService.findOne(currentUserId);
    if (!currentUser) throw new NotFoundException();

    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) throw new NotFoundException();

    const isCurrentUserMember = await this.findOne(
      currentUser.id,
      organization.id,
    );

    if (!isCurrentUserMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (
      isCurrentUserMember.role !== OrganizationRole.ADMIN &&
      isCurrentUserMember.role !== OrganizationRole.OWNER
    ) {
      throw new ForbiddenException(
        'Only the owner and admin of this organization can remove members',
      );
    }

    const targetMembership = await this.findOne(userId, organization.id);
    if (!targetMembership) {
      throw new NotFoundException();
    }

    if (targetMembership.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Organization owner cannot be removed');
    }

    await this.membershipRepo.delete({
      userId,
      organizationId,
    });

    await this.usageService.decrementMembers(organization.id);

    await this.auditLogsService.log({
      organizationId: organizationId,
      userId: currentUserId,
      action: 'MEMBER_REMOVED',
      details: {
        removedUserId: userId,
        role: targetMembership.role,
      },
    });

    await this.notificationService.removeMember(targetMembership.user.email);
    return {
      message: `user with USER-ID ${userId} has been removed`,
    };
  }
}
