import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateWrongQuestionsTable20260131121634 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wrong_questions table
    await queryRunner.createTable(
      new Table({
        name: 'wrong_questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'lesson_question_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'answered_at',
            type: 'timestamp',
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

    // Create foreign keys for wrong_questions
    await createForeignKeyIfNotExists(
      queryRunner,
      'wrong_questions',
      new TableForeignKey({
        name: 'FK_wrong_questions_lesson_question_id',
        columnNames: ['lesson_question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lesson_questions',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'wrong_questions',
      new TableForeignKey({
        name: 'FK_wrong_questions_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for wrong_questions
    await createIndexIfNotExists(
      queryRunner,
      'wrong_questions',
      new TableIndex({
        name: 'IDX_WRONG_QUESTIONS_LESSON_QUESTION_VACCINATOR',
        columnNames: ['lesson_question_id', 'vaccinator_id'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'wrong_questions',
      new TableIndex({
        name: 'IDX_WRONG_QUESTIONS_VACCINATOR_CREATED_AT',
        columnNames: ['vaccinator_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('wrong_questions', 'IDX_WRONG_QUESTIONS_VACCINATOR_CREATED_AT');
    await queryRunner.dropIndex('wrong_questions', 'IDX_WRONG_QUESTIONS_LESSON_QUESTION_VACCINATOR');

    // Drop foreign keys and table
    const wrongQuestionsTable = await queryRunner.getTable('wrong_questions');
    if (wrongQuestionsTable) {
      const foreignKeys = wrongQuestionsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('wrong_questions', foreignKey);
      }
      await queryRunner.dropTable('wrong_questions');
    }
  }
}

