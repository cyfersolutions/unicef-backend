import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificatesTable20260113113213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create certificates table
    await queryRunner.query(`
      CREATE TABLE "certificates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "image_url" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "certificates"`);
  }
}

