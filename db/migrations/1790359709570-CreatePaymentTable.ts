import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTable1790359709570 implements MigrationInterface {
    name = 'CreatePaymentTable1790359709570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscriptionId" uuid, "amount" numeric(10,2) NOT NULL, "organizationId" character varying NOT NULL, "planId" uuid NOT NULL, "status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING', "reference" character varying NOT NULL, "paidAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_fb6e13226928c7ddcf2e1bf6160" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_25f06021d5e959312ce6fabe3c7" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_25f06021d5e959312ce6fabe3c7"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_fb6e13226928c7ddcf2e1bf6160"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    }

}
