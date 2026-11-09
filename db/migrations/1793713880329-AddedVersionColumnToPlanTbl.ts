import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedVersionColumnToPlanTbl1793713880329 implements MigrationInterface {
  name = 'AddedVersionColumnToPlanTbl1793713880329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plan" ADD "version" integer NOT NULL DEFAULT 1`,
    );

    await queryRunner.query(
      `ALTER TABLE "plan" ALTER COLUMN "version" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plan" DROP COLUMN "version"`);
  }
}
