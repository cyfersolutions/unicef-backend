import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createForeignKeyIfNotExists } from '../database/migration-helpers';

export class CreateAdminPermissionsTable20260108141054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admin_permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'admin_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'permission_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'admin_permissions',
      new TableForeignKey({
        name: 'FK_admin_permissions_admin_id',
        columnNames: ['admin_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'admins',
        onDelete: 'CASCADE',
      }),
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'admin_permissions',
      new TableForeignKey({
        name: 'FK_admin_permissions_permission_id',
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('admin_permissions');
    const foreignKeys = table?.foreignKeys;
    if (foreignKeys) {
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('admin_permissions', foreignKey);
      }
    }
    await queryRunner.dropTable('admin_permissions');
  }
}

