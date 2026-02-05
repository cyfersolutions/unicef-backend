import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUrlToGamesTable20260205200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('games');
    const urlColumn = table?.findColumnByName('url');

    // Only add column if it doesn't exist
    if (!urlColumn) {
      await queryRunner.addColumn(
        'games',
        new TableColumn({
          name: 'url',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before dropping
    const table = await queryRunner.getTable('games');
    const urlColumn = table?.findColumnByName('url');

    if (urlColumn) {
      await queryRunner.dropColumn('games', 'url');
    }
  }
}

