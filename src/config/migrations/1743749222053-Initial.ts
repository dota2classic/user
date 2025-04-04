import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1743749222053 implements MigrationInterface {
  name = 'Initial1743749222053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_role_lifetime_entity" ("id" SERIAL NOT NULL, "steam_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "end_time" TIMESTAMP NOT NULL, "role" character varying NOT NULL, CONSTRAINT "PK_d10b4ec58aab1a2f6d5c2aa12bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_entity" ("steam_id" character varying NOT NULL, "name" character varying NOT NULL DEFAULT '', "avatar" character varying, "referral" character varying, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2613c3c655a92fb3731f67fd3e0" PRIMARY KEY ("steam_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_connection_entity" ("steam_id" character varying NOT NULL, "external_id" character varying NOT NULL, "connection" character varying NOT NULL, CONSTRAINT "PK_36636fbbb9aed58200458d6e070" PRIMARY KEY ("steam_id", "external_id", "connection"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_lifetime_entity" ADD CONSTRAINT "FK_947ae7c08a693fdcc9b228d18c0" FOREIGN KEY ("steam_id") REFERENCES "user_entity"("steam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" ADD CONSTRAINT "FK_7ff8dc941ac6abb169134783df6" FOREIGN KEY ("steam_id") REFERENCES "user_entity"("steam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_connection_entity" DROP CONSTRAINT "FK_7ff8dc941ac6abb169134783df6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_lifetime_entity" DROP CONSTRAINT "FK_947ae7c08a693fdcc9b228d18c0"`,
    );
    await queryRunner.query(`DROP TABLE "user_connection_entity"`);
    await queryRunner.query(`DROP TABLE "user_entity"`);
    await queryRunner.query(`DROP TABLE "user_role_lifetime_entity"`);
  }
}
