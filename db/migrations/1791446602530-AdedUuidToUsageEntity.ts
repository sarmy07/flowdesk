import { MigrationInterface, QueryRunner } from "typeorm";

export class AdedUuidToUsageEntity1791446602530 implements MigrationInterface {
    name = 'AdedUuidToUsageEntity1791446602530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usage" DROP CONSTRAINT "PK_7bc33e71ab6c3b71eac72950b44"`);
        await queryRunner.query(`ALTER TABLE "usage" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "usage" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "usage" ADD CONSTRAINT "PK_7bc33e71ab6c3b71eac72950b44" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usage" DROP CONSTRAINT "PK_7bc33e71ab6c3b71eac72950b44"`);
        await queryRunner.query(`ALTER TABLE "usage" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "usage" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usage" ADD CONSTRAINT "PK_7bc33e71ab6c3b71eac72950b44" PRIMARY KEY ("id")`);
    }

}
