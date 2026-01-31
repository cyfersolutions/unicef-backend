import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateVaccinatorProgressTables20260130212454 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create daily_goal_progress table
    await queryRunner.createTable(
      new Table({
        name: 'daily_goal_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'goal_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'goal_value',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'current_goal_value',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_achieved',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'in_progress',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
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

    // Create foreign keys for daily_goal_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'daily_goal_progress',
      new TableForeignKey({
        name: 'FK_daily_goal_progress_goal_id',
        columnNames: ['goal_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'daily_goals',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'daily_goal_progress',
      new TableForeignKey({
        name: 'FK_daily_goal_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create index for daily_goal_progress
    await createIndexIfNotExists(
      queryRunner,
      'daily_goal_progress',
      new TableIndex({
        name: 'IDX_DAILY_GOAL_PROGRESS_GOAL_VACCINATOR_START',
        columnNames: ['goal_id', 'vaccinator_id', 'start_date'],
      }),
    );

    // Create streak_progress table
    await queryRunner.createTable(
      new Table({
        name: 'streak_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'streak_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'current_streak_value',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_achieved',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'in_progress',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'last_achieved_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'date',
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

    // Create foreign keys for streak_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'streak_progress',
      new TableForeignKey({
        name: 'FK_streak_progress_streak_id',
        columnNames: ['streak_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'streaks',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'streak_progress',
      new TableForeignKey({
        name: 'FK_streak_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create index for streak_progress
    await createIndexIfNotExists(
      queryRunner,
      'streak_progress',
      new TableIndex({
        name: 'IDX_STREAK_PROGRESS_STREAK_VACCINATOR_START',
        columnNames: ['streak_id', 'vaccinator_id', 'start_date'],
      }),
    );

    // Create vaccinator_badges table
    await queryRunner.createTable(
      new Table({
        name: 'vaccinator_badges',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'badge_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
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

    // Create foreign keys for vaccinator_badges
    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_badges',
      new TableForeignKey({
        name: 'FK_vaccinator_badges_badge_id',
        columnNames: ['badge_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'badges',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_badges',
      new TableForeignKey({
        name: 'FK_vaccinator_badges_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for vaccinator_badges
    await createIndexIfNotExists(
      queryRunner,
      'vaccinator_badges',
      new TableIndex({
        name: 'IDX_VACCINATOR_BADGES_BADGE_VACCINATOR',
        columnNames: ['badge_id', 'vaccinator_id'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'vaccinator_badges',
      new TableIndex({
        name: 'IDX_VACCINATOR_BADGES_VACCINATOR_DATE',
        columnNames: ['vaccinator_id', 'date'],
      }),
    );

    // Create vaccinator_certificates table
    await queryRunner.createTable(
      new Table({
        name: 'vaccinator_certificates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'certificate_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
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

    // Create foreign keys for vaccinator_certificates
    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_certificates',
      new TableForeignKey({
        name: 'FK_vaccinator_certificates_certificate_id',
        columnNames: ['certificate_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'certificates',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_certificates',
      new TableForeignKey({
        name: 'FK_vaccinator_certificates_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for vaccinator_certificates
    await createIndexIfNotExists(
      queryRunner,
      'vaccinator_certificates',
      new TableIndex({
        name: 'IDX_VACCINATOR_CERTIFICATES_CERT_VACCINATOR',
        columnNames: ['certificate_id', 'vaccinator_id'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'vaccinator_certificates',
      new TableIndex({
        name: 'IDX_VACCINATOR_CERTIFICATES_VACCINATOR_DATE',
        columnNames: ['vaccinator_id', 'date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('vaccinator_certificates', 'IDX_VACCINATOR_CERTIFICATES_VACCINATOR_DATE');
    await queryRunner.dropIndex('vaccinator_certificates', 'IDX_VACCINATOR_CERTIFICATES_CERT_VACCINATOR');
    await queryRunner.dropIndex('vaccinator_badges', 'IDX_VACCINATOR_BADGES_VACCINATOR_DATE');
    await queryRunner.dropIndex('vaccinator_badges', 'IDX_VACCINATOR_BADGES_BADGE_VACCINATOR');
    await queryRunner.dropIndex('streak_progress', 'IDX_STREAK_PROGRESS_STREAK_VACCINATOR_START');
    await queryRunner.dropIndex('daily_goal_progress', 'IDX_DAILY_GOAL_PROGRESS_GOAL_VACCINATOR_START');

    // Drop foreign keys and tables
    const vaccinatorCertificatesTable = await queryRunner.getTable('vaccinator_certificates');
    if (vaccinatorCertificatesTable) {
      const foreignKeys = vaccinatorCertificatesTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('vaccinator_certificates', foreignKey);
      }
      await queryRunner.dropTable('vaccinator_certificates');
    }

    const vaccinatorBadgesTable = await queryRunner.getTable('vaccinator_badges');
    if (vaccinatorBadgesTable) {
      const foreignKeys = vaccinatorBadgesTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('vaccinator_badges', foreignKey);
      }
      await queryRunner.dropTable('vaccinator_badges');
    }

    const streakProgressTable = await queryRunner.getTable('streak_progress');
    if (streakProgressTable) {
      const foreignKeys = streakProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('streak_progress', foreignKey);
      }
      await queryRunner.dropTable('streak_progress');
    }

    const dailyGoalProgressTable = await queryRunner.getTable('daily_goal_progress');
    if (dailyGoalProgressTable) {
      const foreignKeys = dailyGoalProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('daily_goal_progress', foreignKey);
      }
      await queryRunner.dropTable('daily_goal_progress');
    }
  }
}

