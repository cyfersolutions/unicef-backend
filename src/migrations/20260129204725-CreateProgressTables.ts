import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateProgressTables20260129204725 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create module_progress table
    await queryRunner.createTable(
      new Table({
        name: 'module_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'module_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'attempt_number',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'units_completed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'current_unit_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'mastery_level',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'xp_earned',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'start_datetime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_datetime',
            type: 'timestamp',
            isNullable: true,
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

    // Create foreign keys for module_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'module_progress',
      new TableForeignKey({
        name: 'FK_module_progress_module_id',
        columnNames: ['module_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'modules',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'module_progress',
      new TableForeignKey({
        name: 'FK_module_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'module_progress',
      new TableForeignKey({
        name: 'FK_module_progress_current_unit_id',
        columnNames: ['current_unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'units',
        onDelete: 'SET NULL',
      }),
    );

    // Create index for module_progress
    await createIndexIfNotExists(
      queryRunner,
      'module_progress',
      new TableIndex({
        name: 'IDX_MODULE_PROGRESS_MODULE_VACCINATOR_ATTEMPT',
        columnNames: ['module_id', 'vaccinator_id', 'attempt_number'],
      }),
    );

    // Create unit_progress table
    await queryRunner.createTable(
      new Table({
        name: 'unit_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'unit_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'attempt_number',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'lessons_completed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'current_lesson_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'mastery_level',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'xp_earned',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'start_datetime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_datetime',
            type: 'timestamp',
            isNullable: true,
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

    // Create foreign keys for unit_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'unit_progress',
      new TableForeignKey({
        name: 'FK_unit_progress_unit_id',
        columnNames: ['unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'units',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'unit_progress',
      new TableForeignKey({
        name: 'FK_unit_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'unit_progress',
      new TableForeignKey({
        name: 'FK_unit_progress_current_lesson_id',
        columnNames: ['current_lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'SET NULL',
      }),
    );

    // Create index for unit_progress
    await createIndexIfNotExists(
      queryRunner,
      'unit_progress',
      new TableIndex({
        name: 'IDX_UNIT_PROGRESS_UNIT_VACCINATOR_ATTEMPT',
        columnNames: ['unit_id', 'vaccinator_id', 'attempt_number'],
      }),
    );

    // Create lesson_progress table
    await queryRunner.createTable(
      new Table({
        name: 'lesson_progress',
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
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'attempt_number',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'questions_completed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'current_question_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'mastery_level',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'xp_earned',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'start_datetime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_datetime',
            type: 'timestamp',
            isNullable: true,
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

    // Create foreign keys for lesson_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_progress',
      new TableForeignKey({
        name: 'FK_lesson_progress_lesson_id',
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_progress',
      new TableForeignKey({
        name: 'FK_lesson_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_progress',
      new TableForeignKey({
        name: 'FK_lesson_progress_current_question_id',
        columnNames: ['current_question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lesson_questions',
        onDelete: 'SET NULL',
      }),
    );

    // Create index for lesson_progress
    await createIndexIfNotExists(
      queryRunner,
      'lesson_progress',
      new TableIndex({
        name: 'IDX_LESSON_PROGRESS_LESSON_VACCINATOR_ATTEMPT',
        columnNames: ['lesson_id', 'vaccinator_id', 'attempt_number'],
      }),
    );

    // Create lesson_question_progress table
    await queryRunner.createTable(
      new Table({
        name: 'lesson_question_progress',
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
            name: 'attempt_number',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'xp_earned',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'start_datetime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_datetime',
            type: 'timestamp',
            isNullable: true,
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

    // Create foreign keys for lesson_question_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_question_progress',
      new TableForeignKey({
        name: 'FK_lesson_question_progress_lesson_question_id',
        columnNames: ['lesson_question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lesson_questions',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'lesson_question_progress',
      new TableForeignKey({
        name: 'FK_lesson_question_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create index for lesson_question_progress
    await createIndexIfNotExists(
      queryRunner,
      'lesson_question_progress',
      new TableIndex({
        name: 'IDX_LESSON_QUESTION_PROGRESS_LQ_VACCINATOR_ATTEMPT',
        columnNames: ['lesson_question_id', 'vaccinator_id', 'attempt_number'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('lesson_question_progress', 'IDX_LESSON_QUESTION_PROGRESS_LQ_VACCINATOR_ATTEMPT');
    await queryRunner.dropIndex('lesson_progress', 'IDX_LESSON_PROGRESS_LESSON_VACCINATOR_ATTEMPT');
    await queryRunner.dropIndex('unit_progress', 'IDX_UNIT_PROGRESS_UNIT_VACCINATOR_ATTEMPT');
    await queryRunner.dropIndex('module_progress', 'IDX_MODULE_PROGRESS_MODULE_VACCINATOR_ATTEMPT');

    // Drop foreign keys and tables
    const lessonQuestionProgressTable = await queryRunner.getTable('lesson_question_progress');
    if (lessonQuestionProgressTable) {
      const foreignKeys = lessonQuestionProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('lesson_question_progress', foreignKey);
      }
      await queryRunner.dropTable('lesson_question_progress');
    }

    const lessonProgressTable = await queryRunner.getTable('lesson_progress');
    if (lessonProgressTable) {
      const foreignKeys = lessonProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('lesson_progress', foreignKey);
      }
      await queryRunner.dropTable('lesson_progress');
    }

    const unitProgressTable = await queryRunner.getTable('unit_progress');
    if (unitProgressTable) {
      const foreignKeys = unitProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('unit_progress', foreignKey);
      }
      await queryRunner.dropTable('unit_progress');
    }

    const moduleProgressTable = await queryRunner.getTable('module_progress');
    if (moduleProgressTable) {
      const foreignKeys = moduleProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('module_progress', foreignKey);
      }
      await queryRunner.dropTable('module_progress');
    }
  }
}

