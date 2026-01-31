import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createForeignKeyIfNotExists } from '../database/migration-helpers';

export class CreateUnitsTable20260108141056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'units',
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
            name: 'order_no',
            type: 'int',
            isNullable: true,
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
            name: 'module_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'units',
      new TableForeignKey({
        name: 'FK_units_module_id',
        columnNames: ['module_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'modules',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('units');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('module_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('units', foreignKey);
    }
    await queryRunner.dropTable('units');
  }
}

