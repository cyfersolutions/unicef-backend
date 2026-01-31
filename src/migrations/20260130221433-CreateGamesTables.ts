import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateGamesTables20260130221433 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create games table
    await queryRunner.createTable(
      new Table({
        name: 'games',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
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

    // Create unit_games table
    await queryRunner.createTable(
      new Table({
        name: 'unit_games',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'game_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'unit_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'lesson_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'passing_score',
            type: 'int',
            isNullable: false,
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

    // Create foreign keys for unit_games
    await createForeignKeyIfNotExists(
      queryRunner,
      'unit_games',
      new TableForeignKey({
        name: 'FK_unit_games_game_id',
        columnNames: ['game_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'unit_games',
      new TableForeignKey({
        name: 'FK_unit_games_unit_id',
        columnNames: ['unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'units',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'unit_games',
      new TableForeignKey({
        name: 'FK_unit_games_lesson_id',
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for unit_games
    await createIndexIfNotExists(
      queryRunner,
      'unit_games',
      new TableIndex({
        name: 'IDX_UNIT_GAMES_GAME_UNIT',
        columnNames: ['game_id', 'unit_id'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'unit_games',
      new TableIndex({
        name: 'IDX_UNIT_GAMES_UNIT_LESSON',
        columnNames: ['unit_id', 'lesson_id'],
      }),
    );

    // Create vaccinator_unit_games_progress table
    await queryRunner.createTable(
      new Table({
        name: 'vaccinator_unit_games_progress',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'unit_game_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vaccinator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'score',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'attempt',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'ratings',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'other_fields',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'is_passed',
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

    // Create foreign keys for vaccinator_unit_games_progress
    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_unit_games_progress',
      new TableForeignKey({
        name: 'FK_vaccinator_unit_games_progress_unit_game_id',
        columnNames: ['unit_game_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'unit_games',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinator_unit_games_progress',
      new TableForeignKey({
        name: 'FK_vaccinator_unit_games_progress_vaccinator_id',
        columnNames: ['vaccinator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccinators',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for vaccinator_unit_games_progress
    await createIndexIfNotExists(
      queryRunner,
      'vaccinator_unit_games_progress',
      new TableIndex({
        name: 'IDX_VACCINATOR_UNIT_GAMES_PROGRESS_UNIT_GAME_VACCINATOR_ATTEMPT',
        columnNames: ['unit_game_id', 'vaccinator_id', 'attempt'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'vaccinator_unit_games_progress',
      new TableIndex({
        name: 'IDX_VACCINATOR_UNIT_GAMES_PROGRESS_VACCINATOR_COMPLETED',
        columnNames: ['vaccinator_id', 'is_completed'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex(
      'vaccinator_unit_games_progress',
      'IDX_VACCINATOR_UNIT_GAMES_PROGRESS_VACCINATOR_COMPLETED',
    );
    await queryRunner.dropIndex(
      'vaccinator_unit_games_progress',
      'IDX_VACCINATOR_UNIT_GAMES_PROGRESS_UNIT_GAME_VACCINATOR_ATTEMPT',
    );
    await queryRunner.dropIndex('unit_games', 'IDX_UNIT_GAMES_UNIT_LESSON');
    await queryRunner.dropIndex('unit_games', 'IDX_UNIT_GAMES_GAME_UNIT');

    // Drop foreign keys and tables
    const vaccinatorUnitGamesProgressTable = await queryRunner.getTable('vaccinator_unit_games_progress');
    if (vaccinatorUnitGamesProgressTable) {
      const foreignKeys = vaccinatorUnitGamesProgressTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('vaccinator_unit_games_progress', foreignKey);
      }
      await queryRunner.dropTable('vaccinator_unit_games_progress');
    }

    const unitGamesTable = await queryRunner.getTable('unit_games');
    if (unitGamesTable) {
      const foreignKeys = unitGamesTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('unit_games', foreignKey);
      }
      await queryRunner.dropTable('unit_games');
    }

    await queryRunner.dropTable('games');
  }
}

