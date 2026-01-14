import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreaksTable20260113121110 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for streak type
    await queryRunner.query(`
      CREATE TYPE "streak_type_enum" AS ENUM('DAILY_LOGIN', 'DAILY_PRACTICE', 'LESSONS_COMPLETED');
    `);

    // Create streaks table
    await queryRunner.query(`
      CREATE TABLE "streaks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" streak_type_enum NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "streaks"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "streak_type_enum"`);
  }
}

