import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProvinceDesignationCompletedToPersonalInfo20260201230918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('personal_info');
    if (!table) {
      throw new Error('Table personal_info does not exist');
    }

    // Add province column
    const provinceColumn = table.findColumnByName('province');
    if (!provinceColumn) {
      await queryRunner.addColumn(
        'personal_info',
        new TableColumn({
          name: 'province',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // Add designation column
    const designationColumn = table.findColumnByName('designation');
    if (!designationColumn) {
      await queryRunner.addColumn(
        'personal_info',
        new TableColumn({
          name: 'designation',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // Add completed column
    const completedColumn = table.findColumnByName('completed');
    if (!completedColumn) {
      await queryRunner.addColumn(
        'personal_info',
        new TableColumn({
          name: 'completed',
          type: 'boolean',
          default: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('personal_info');
    if (!table) {
      throw new Error('Table personal_info does not exist');
    }

    // Remove completed column
    const completedColumn = table.findColumnByName('completed');
    if (completedColumn) {
      await queryRunner.dropColumn('personal_info', 'completed');
    }

    // Remove designation column
    const designationColumn = table.findColumnByName('designation');
    if (designationColumn) {
      await queryRunner.dropColumn('personal_info', 'designation');
    }

    // Remove province column
    const provinceColumn = table.findColumnByName('province');
    if (provinceColumn) {
      await queryRunner.dropColumn('personal_info', 'province');
    }
  }
}

