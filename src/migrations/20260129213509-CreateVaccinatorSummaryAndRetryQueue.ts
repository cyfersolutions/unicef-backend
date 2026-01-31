import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateVaccinatorSummaryAndRetryQueue20260129213509 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vaccinator_summary table
    await queryRunner.createTable(
      new Table({
        name: 'vaccinator_summary',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'total_xp',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'total_badges',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'total_certificates',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'modules_completed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'units_completed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'lessons_completed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'questions_answered',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'questions_correct',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'overall_accuracy',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'current_streak',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'longest_streak',
            type: 'int',
            isNullable: false,
            default: 0,
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

    // Create foreign key for vaccinator_summary
    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_summary',
      new TableForeignKey({
        name: 'FK_vaccinator_summary_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create retry_queue table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS retry_queue  (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "queue_name" varchar NOT NULL,
        "payload" jsonb NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "retry_count" int NOT NULL DEFAULT 0,
        "max_retries" int NOT NULL DEFAULT 3,
        "error" text,
        "processed_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_retry_queue" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for retry_queue
    await createIndexIfNotExists(
      queryRunner,
      'retry_queue',
      new TableIndex({
        name: 'IDX_RETRY_QUEUE_STATUS_CREATED_AT',
        columnNames: ['status', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('retry_queue', 'IDX_RETRY_QUEUE_STATUS_CREATED_AT');

    // Drop foreign keys and tables
    const vaccinatorSummaryTable = await queryRunner.getTable('vaccinator_summary');
    if (vaccinatorSummaryTable) {
      const foreignKeys = vaccinatorSummaryTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('vaccinator_summary', foreignKey);
      }
      await queryRunner.dropTable('vaccinator_summary');
    }

    // Drop retry_queue table
    await queryRunner.query(`DROP TABLE IF EXISTS "retry_queue"`);
  }
}

