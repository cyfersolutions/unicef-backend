import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLessonsTable20260108141057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lessons',
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
            name: 'unit_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'pass_threshold',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'failed_threshold',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'lessons',
      new TableForeignKey({
        columnNames: ['unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'units',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('lessons');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('unit_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('lessons', foreignKey);
    }
    await queryRunner.dropTable('lessons');
  }
}

