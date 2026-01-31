import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { createIndexIfNotExists } from '../database/migration-helpers';

export class CreateAuditLogsTable20260129201612 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "audit_action_enum" AS ENUM(
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'OTHER'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "http_method_enum" AS ENUM(
        'GET',
        'POST',
        'PATCH',
        'PUT',
        'DELETE'
      );
    `);

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_role',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'audit_action_enum',
            isNullable: false,
          },
          {
            name: 'method',
            type: 'http_method_enum',
            isNullable: false,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'request_body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'response_body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status_code',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'error',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'response_time_ms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance
    await createIndexIfNotExists(
      queryRunner,
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_USER_ID_CREATED_AT',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_ACTION_CREATED_AT',
        columnNames: ['action', 'created_at'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_METHOD_ENDPOINT',
        columnNames: ['method', 'endpoint'],
      }),
    );

    await createIndexIfNotExists(
      queryRunner,
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_USER_ID_CREATED_AT');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ACTION_CREATED_AT');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_METHOD_ENDPOINT');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_CREATED_AT');

    // Drop table
    await queryRunner.dropTable('audit_logs');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "audit_action_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "http_method_enum"`);
  }
}

