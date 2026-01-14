import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBadgesTable20260108141059 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reuse rule_context_enum if it exists (created in XPRules migration)
    // If it doesn't exist, create it
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "rule_context_enum" AS ENUM('LESSON', 'UNIT', 'MODULE', 'QUESTION', 'DAILY_PRACTICE', 'STREAK', 'DAILY_GOAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum type for badge condition type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "badge_condition_type_enum" AS ENUM('COMPLETION', 'ACCURACY_PERCENTAGE', 'MASTERY_PERCENTAGE', 'STREAK_DAYS', 'TOTAL_XP', 'TOTAL_LEVELS_COMPLETED', 'FIRST_TIME');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Reuse condition_operator_enum if it exists (created in XPRules migration)
    // If it doesn't exist, create it
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "condition_operator_enum" AS ENUM('=', '>=', '<=', 'BETWEEN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create badges table
    await queryRunner.query(`
      CREATE TABLE "badges" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar UNIQUE NOT NULL,
        "tier" varchar NOT NULL,
        "description" text,
        "icon_url" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "badges"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "badge_condition_type_enum"`);
    // Note: We don't drop rule_context_enum and condition_operator_enum as they might be used by other tables
  }
}

