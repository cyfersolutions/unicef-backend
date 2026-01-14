import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePersonasTable20260113171947 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create personas table
    await queryRunner.query(`
      CREATE TABLE "personas" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "category" varchar NOT NULL,
        "image_url" text,
        "voice_url" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "personas"`);
  }
}

