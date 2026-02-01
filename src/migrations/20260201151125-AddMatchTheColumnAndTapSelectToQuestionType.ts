import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchTheColumnAndTapSelectToQuestionType20260201151125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum values already exist before adding
    const enumValues = await queryRunner.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'question_type_enum'
      )
    `);

    const existingValues = enumValues.map((row: any) => row.enumlabel);

    // Add MATCH_THE_COLUMN if it doesn't exist
    if (!existingValues.includes('MATCH_THE_COLUMN')) {
      await queryRunner.query(`
        ALTER TYPE "question_type_enum" ADD VALUE 'MATCH_THE_COLUMN';
      `);
    }

    // Add TAP_SELECT if it doesn't exist
    if (!existingValues.includes('TAP_SELECT')) {
      await queryRunner.query(`
        ALTER TYPE "question_type_enum" ADD VALUE 'TAP_SELECT';
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // To remove enum values, you would need to:
    // 1. Create a new enum without the values
    // 2. Update all columns to use the new enum
    // 3. Drop the old enum
    // This is a complex operation and may not be necessary for rollback
    // For now, we'll leave this empty as removing enum values is not straightforward
    // If rollback is needed, a manual process would be required
  }
}

