import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { createForeignKeyIfNotExists, createIndexIfNotExists } from '../database/migration-helpers';

export class CreateUsersTables20260129201335 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create personal_info table
    await queryRunner.createTable(
      new Table({
        name: 'personal_info',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'cnic',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'text',
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

    // Create supervisors table
    await queryRunner.createTable(
      new Table({
        name: 'supervisors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'detail_id',
            type: 'uuid',
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

    // Create foreign key for supervisors -> personal_info
    await createForeignKeyIfNotExists(
      queryRunner,
      'supervisors',
      new TableForeignKey({
        name: 'FK_supervisors_detail_id',
        columnNames: ['detail_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'personal_info',
        onDelete: 'CASCADE',
      }),
    );

    // Create unique index on supervisors.detail_id
    await createIndexIfNotExists(
      queryRunner,
      'supervisors',
      new TableIndex({
        name: 'IDX_SUPERVISORS_DETAIL_ID',
        columnNames: ['detail_id'],
        isUnique: true,
      }),
    );

    // Create vaccinators table
    await queryRunner.createTable(
      new Table({
        name: 'vaccinators',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'supervisor_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'detail_id',
            type: 'uuid',
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

    // Create foreign key for vaccinators -> supervisors
    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinators',
      new TableForeignKey({
        name: 'FK_vaccinators_supervisor_id',
        columnNames: ['supervisor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'supervisors',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign key for vaccinators -> personal_info
    await createForeignKeyIfNotExists(
      queryRunner,
      'vaccinators',
      new TableForeignKey({
        name: 'FK_vaccinators_detail_id',
        columnNames: ['detail_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'personal_info',
        onDelete: 'CASCADE',
      }),
    );

    // Create unique index on vaccinators.detail_id
    await createIndexIfNotExists(
      queryRunner,
      'vaccinators',
      new TableIndex({
        name: 'IDX_VACCINATORS_DETAIL_ID',
        columnNames: ['detail_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop vaccinators table and its foreign keys
    const vaccinatorsTable = await queryRunner.getTable('vaccinators');
    if (vaccinatorsTable) {
      const foreignKeys = vaccinatorsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('vaccinators', foreignKey);
      }
      const indexes = vaccinatorsTable.indices;
      for (const index of indexes) {
        await queryRunner.dropIndex('vaccinators', index);
      }
      await queryRunner.dropTable('vaccinators');
    }

    // Drop supervisors table and its foreign keys
    const supervisorsTable = await queryRunner.getTable('supervisors');
    if (supervisorsTable) {
      const foreignKeys = supervisorsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('supervisors', foreignKey);
      }
      const indexes = supervisorsTable.indices;
      for (const index of indexes) {
        await queryRunner.dropIndex('supervisors', index);
      }
      await queryRunner.dropTable('supervisors');
    }

    // Drop personal_info table
    await queryRunner.dropTable('personal_info');
  }
}

