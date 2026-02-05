import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOrderNoToOnboardingQuestions20260205210000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('onboarding_questions');
    const orderNoColumn = table?.findColumnByName('order_no');

    // Only add column if it doesn't exist
    if (!orderNoColumn) {
      await queryRunner.addColumn(
        'onboarding_questions',
        new TableColumn({
          name: 'order_no',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before dropping
    const table = await queryRunner.getTable('onboarding_questions');
    const orderNoColumn = table?.findColumnByName('order_no');

    if (orderNoColumn) {
      await queryRunner.dropColumn('onboarding_questions', 'order_no');
    }
  }
}

