import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedAuditlogsTbl1792761552790 implements MigrationInterface {
    name = 'AddedAuditlogsTbl1792761552790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid, "userId" uuid, "action" character varying NOT NULL, "details" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }

}
