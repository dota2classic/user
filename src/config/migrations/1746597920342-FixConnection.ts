import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixConnection1746597920342 implements MigrationInterface {
  name = 'FixConnection1746597920342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" DROP CONSTRAINT "PK_36636fbbb9aed58200458d6e070"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" DROP COLUMN "connection"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_external_connection" AS ENUM('DISCORD', 'TWITCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" ADD "connection" "public"."user_external_connection" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" ADD CONSTRAINT "PK_c3eb9e5330de7baf8ee62e3d4ce" PRIMARY KEY ("steam_id", "connection")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" DROP CONSTRAINT "PK_c3eb9e5330de7baf8ee62e3d4ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" DROP COLUMN "connection"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_external_connection"`);
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" ADD "connection" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" ADD CONSTRAINT "PK_36636fbbb9aed58200458d6e070" PRIMARY KEY ("steam_id", "external_id", "connection")`,
    );
  }
}
