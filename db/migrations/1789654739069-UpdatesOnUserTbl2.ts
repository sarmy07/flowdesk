import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatesOnUserTbl21789654739069 implements MigrationInterface {
    name = 'UpdatesOnUserTbl21789654739069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
