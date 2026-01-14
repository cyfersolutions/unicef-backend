import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnifiedRulesTable20260113164646 implements MigrationInterface {
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

    // Reuse condition_operator_enum if it exists (created in XPRules migration)
    // If it doesn't exist, create it
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "condition_operator_enum" AS ENUM('=', '>=', '<=', 'BETWEEN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Reuse xp_rule_type_enum if it exists (created in XPRules migration)
    // If it doesn't exist, create it
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "xp_rule_type_enum" AS ENUM('BASE', 'BONUS');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create unified rules table
    await queryRunner.query(`
      CREATE TABLE "rules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "context" rule_context_enum NOT NULL,
        "context_entity_id" uuid,
        "condition" varchar NOT NULL,
        "condition_operator" condition_operator_enum NOT NULL,
        "condition_value_int" int,
        "condition_value_int_max" int,
        "condition_value_uuid" uuid,
        "condition_value_string" varchar,
        "xp_value" int,
        "xp_percentage" int,
        "xp_rule_type" xp_rule_type_enum NOT NULL,
        "badge_id" uuid,
        "certificate_id" uuid,
        "streak_id" uuid,
        "daily_goal_id" uuid,
        "priority" int DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_rule_badge" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_rule_certificate" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_rule_streak" FOREIGN KEY ("streak_id") REFERENCES "streaks"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_rule_daily_goal" FOREIGN KEY ("daily_goal_id") REFERENCES "daily_goals"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "rules"`);
    // Note: We don't drop the enum types as they might be used by other tables
  }
}

