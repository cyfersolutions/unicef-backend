import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestionsTable20260113181022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for question type
    await queryRunner.query(`
      CREATE TYPE "question_type_enum" AS ENUM(
        'MULTIPLE_CHOICE',
        'FILL_IN_THE_BLANKS',
        'MATCH_THE_PAIRS',
        'TRUE_FALSE',
        'DRAG_AND_DROP',
        'AUDIO_BASED',
        'IMAGE_BASED',
        'SCENARIO_BASED',
        'TIMED_CHALLENGES',
        'MISTAKE_CORRECTION'
      );
    `);

    // Create questions table
    await queryRunner.query(`
      CREATE TABLE "questions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "lesson_id" uuid,
        "question_type" question_type_enum NOT NULL,
        "question_text" text,
        "question_image_url" text,
        "question_audio_url" text,
        "options" jsonb,
        "correct_answer" jsonb,
        "points" int DEFAULT 1,
        "xp" int,
        "order_no" int,
        "persona_id" uuid,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_question_lesson" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_question_persona" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL
      )
    `);

    // Create unique index on (lesson_id, order_no) where lesson_id is not null
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_question_lesson_order" 
      ON "questions" ("lesson_id", "order_no") 
      WHERE "lesson_id" IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_question_lesson_order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "questions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "question_type_enum"`);
  }
}

