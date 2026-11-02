import { Injectable } from '@nestjs/common';
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
}
