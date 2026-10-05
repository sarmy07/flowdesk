import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUsernameToUserEntity1791191346444 implements MigrationInterface {
    name = 'AddedUsernameToUserEntity1791191346444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
