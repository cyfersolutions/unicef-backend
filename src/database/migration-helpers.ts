import { QueryRunner, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Helper function to safely create a foreign key if it doesn't exist
 */
export async function createForeignKeyIfNotExists(
  queryRunner: QueryRunner,
  tableName: string,
  foreignKey: TableForeignKey,
): Promise<void> {
  const table = await queryRunner.getTable(tableName);
  if (!table) {
    throw new Error(`Table ${tableName} does not exist`);
  }

  const fkExists = table.foreignKeys.some(
    (fk) =>
      fk.columnNames.length === foreignKey.columnNames.length &&
      fk.columnNames.every((col) => foreignKey.columnNames.includes(col)) &&
      fk.referencedTableName === foreignKey.referencedTableName &&
      fk.referencedColumnNames.length === foreignKey.referencedColumnNames.length &&
      fk.referencedColumnNames.every((col) => foreignKey.referencedColumnNames.includes(col)),
  );

  if (!fkExists) {
    // Set explicit name if provided, otherwise TypeORM will generate one
    if (foreignKey.name) {
      // Check if constraint with this name already exists
      const constraintExists = table.foreignKeys.some((fk) => fk.name === foreignKey.name);
      if (!constraintExists) {
        await queryRunner.createForeignKey(tableName, foreignKey);
      }
    } else {
      await queryRunner.createForeignKey(tableName, foreignKey);
    }
  }
}

/**
 * Helper function to safely create an index if it doesn't exist
 */
export async function createIndexIfNotExists(
  queryRunner: QueryRunner,
  tableName: string,
  index: TableIndex,
): Promise<void> {
  const table = await queryRunner.getTable(tableName);
  if (!table) {
    throw new Error(`Table ${tableName} does not exist`);
  }

  const indexExists = table.indices.some((idx) => idx.name === index.name);

  if (!indexExists) {
    await queryRunner.createIndex(tableName, index);
  }
}

