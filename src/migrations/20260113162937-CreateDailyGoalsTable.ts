import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyGoalsTable20260113162937 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for daily goal type
    await queryRunner.query(`
      CREATE TYPE "daily_goal_type_enum" AS ENUM('TIME_SPENT', 'LESSON_COMPLETED', 'MODULE_COMPLETED', 'UNITS_COMPLETED');
    `);

    // Create daily_goals table
    await queryRunner.query(`
      CREATE TABLE "daily_goals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" daily_goal_type_enum NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "daily_goals"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "daily_goal_type_enum"`);
  }
}

