import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedUsageTbl1790946105591 implements MigrationInterface {
    name = 'GeneratedUsageTbl1790946105591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usage" ("id" SERIAL NOT NULL, "organizationId" uuid NOT NULL, "projects" integer NOT NULL DEFAULT '0', "members" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_63052e9cb202de56fd37e3ab5f" UNIQUE ("organizationId"), CONSTRAINT "PK_7bc33e71ab6c3b71eac72950b44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "usage" ADD CONSTRAINT "FK_63052e9cb202de56fd37e3ab5f4" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usage" DROP CONSTRAINT "FK_63052e9cb202de56fd37e3ab5f4"`);
        await queryRunner.query(`DROP TABLE "usage"`);
    }

}
