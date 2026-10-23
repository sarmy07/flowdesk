import { Injectable } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Repository } from 'typeorm';

interface CreateAuditLog {
  organizationId: string | null;
  userId: string | null;
  action: string;
  details: Record<string, any>;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}
  async log(data: CreateAuditLog) {
    const auditLog = this.auditLogRepo.create({
      organizationId: data.organizationId,
      userId: data.userId,
      action: data.action,
      details: data.details ?? {},
    });

    return this.auditLogRepo.save(auditLog);
  }

  findAll() {
    return `This action returns all auditLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditLog`;
  }

  update(id: number, updateAuditLogDto: UpdateAuditLogDto) {
    return `This action updates a #${id} auditLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditLog`;
  }
}
