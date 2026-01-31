import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class RefactorQuestionsAndLessons20260129203912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create lesson_questions table
    await queryRunner.createTable(
      new Table({
        name: 'lesson_questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'lesson_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'question_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'order_no',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Step 2: Create foreign keys for lesson_questions
    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_questions',
      new TableForeignKey({
        name: 'FK_lesson_questions_lesson_id',
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_questions',
      new TableForeignKey({
        name: 'FK_lesson_questions_question_id',
        columnNames: ['question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'questions',
        onDelete: 'CASCADE',
      }),
    );

    // Step 3: Create unique index on (lesson_id, order_no)
    await createIndexIfNotExists(
      queryRunner,
      'lesson_questions',
      new TableIndex({
        name: 'IDX_LESSON_QUESTIONS_LESSON_ORDER',
        columnNames: ['lesson_id', 'order_no'],
        isUnique: true,
      }),
    );

    // Step 4: Migrate existing data from questions.lesson_id to lesson_questions
    // Only migrate questions that have a lesson_id and order_no
    // await queryRunner.query(`
    //   INSERT INTO lesson_questions (lesson_id, question_id, order_no, created_at)
    //   SELECT lesson_id, id as question_id, order_no, created_at
    //   FROM questions
    //   WHERE lesson_id IS NOT NULL AND order_no IS NOT NULL
    //   ON CONFLICT DO NOTHING;
    // `);

    // // Step 5: Drop the unique index on questions (lesson_id, order_no)
    // await queryRunner.query(`DROP INDEX IF EXISTS "idx_question_lesson_order"`);

    // Step 6: Drop foreign key constraint from questions.lesson_id
    const questionsTable = await queryRunner.getTable('questions');
    if (questionsTable) {
      const foreignKey = questionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('lesson_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('questions', foreignKey);
      }
    }

    // Step 7: Drop lesson_id column from questions table
    await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN IF EXISTS "lesson_id"`);

    // Step 8: Add icon_url column to lessons table
    await queryRunner.query(`
      ALTER TABLE "lessons" 
      ADD COLUMN IF NOT EXISTS "icon_url" text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add lesson_id column back to questions table
    await queryRunner.query(`
      ALTER TABLE "questions" 
      ADD COLUMN IF NOT EXISTS "lesson_id" uuid;
    `);

    // Step 2: Recreate foreign key constraint
    await createForeignKeyIfNotExists(
      queryRunner,
      'questions',
      new TableForeignKey({
        name: 'FK_questions_lesson_id',
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'SET NULL',
      }),
    );

    // Step 3: Migrate data back from lesson_questions to questions.lesson_id
    // Take the first lesson_id for each question (if multiple exist)
    await queryRunner.query(`
      UPDATE questions q
      SET lesson_id = (
        SELECT lq.lesson_id
        FROM lesson_questions lq
        WHERE lq.question_id = q.id
        ORDER BY lq.order_no ASC
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM lesson_questions lq WHERE lq.question_id = q.id
      );
    `);

    // Step 4: Recreate unique index on questions (lesson_id, order_no)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_question_lesson_order" 
      ON "questions" ("lesson_id", "order_no") 
      WHERE "lesson_id" IS NOT NULL;
    `);

    // Step 5: Drop icon_url column from lessons table
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN IF EXISTS "icon_url"`);

    // Step 6: Drop lesson_questions table (cascade will drop foreign keys and indexes)
    await queryRunner.dropTable('lesson_questions');
  }
}

