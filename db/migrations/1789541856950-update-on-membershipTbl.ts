import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOnMembershipTbl1789541856950 implements MigrationInterface {
    name = 'UpdateOnMembershipTbl1789541856950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD "organizationId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD CONSTRAINT "UQ_64893eb3c6fcaeaaee71a4d0ae1" UNIQUE ("userId", "organizationId")`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD CONSTRAINT "FK_187d573e43b2c2aa3960df20b78" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD CONSTRAINT "FK_98d23786d647f0ccf477b3b2867" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "memberships" DROP CONSTRAINT "FK_98d23786d647f0ccf477b3b2867"`);
        await queryRunner.query(`ALTER TABLE "memberships" DROP CONSTRAINT "FK_187d573e43b2c2aa3960df20b78"`);
        await queryRunner.query(`ALTER TABLE "memberships" DROP CONSTRAINT "UQ_64893eb3c6fcaeaaee71a4d0ae1"`);
        await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD "organizationId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "memberships" ADD "userId" character varying NOT NULL`);
    }

}
