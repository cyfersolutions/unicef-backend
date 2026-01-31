import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createForeignKeyIfNotExists } from '../database/migration-helpers';

export class CreateAdminsTable20260108141053 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admins',
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
            name: 'password_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'role_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    await createForeignKeyIfNotExists(
      queryRunner,
      'admins',
      new TableForeignKey({
        name: 'FK_admins_role_id',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('admins');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('role_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('admins', foreignKey);
    }
    await queryRunner.dropTable('admins');
  }
}

