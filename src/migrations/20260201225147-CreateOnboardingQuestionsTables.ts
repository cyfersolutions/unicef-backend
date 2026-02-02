import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateOnboardingQuestionsTables20260201225147 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create onboarding_questions table
    await queryRunner.createTable(
      new Table({
        name: 'onboarding_questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'question_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'question_image',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'options',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create onboarding_questions_response table
    await queryRunner.createTable(
      new Table({
        name: 'onboarding_questions_response',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'question_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'answer',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'datetime',
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

    // Create foreign keys
    const fkQuestion = new TableForeignKey({
      name: 'FK_onboarding_response_question',
      columnNames: ['question_id'],
      referencedTableName: 'onboarding_questions',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    });

    const fkVaccinator = new TableForeignKey({
      name: 'FK_onboarding_response_vaccinator',
      columnNames: ['vaccinator_id'],
      referencedTableName: 'vaccinators',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    });

    await createForeignKeyIfNotExists(queryRunner, 'onboarding_questions_response', fkQuestion);
    await createForeignKeyIfNotExists(queryRunner, 'onboarding_questions_response', fkVaccinator);

    // Create indexes
    const indexQuestionVaccinator = new TableIndex({
      name: 'IDX_onboarding_response_question_vaccinator',
      columnNames: ['question_id', 'vaccinator_id'],
    });

    await createIndexIfNotExists(queryRunner, 'onboarding_questions_response', indexQuestionVaccinator);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('onboarding_questions_response', true);
    await queryRunner.dropTable('onboarding_questions', true);
  }
}

