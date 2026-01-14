import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeders } from './index';
import dataSource from '../database/data-source';

config();

async function seed() {
  let connection: DataSource | null = null;

  try {
    console.log('🔌 Connecting to database...');
    connection = await dataSource.initialize();
    console.log('✓ Database connected\n');

    await runSeeders(connection);

    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    if (connection && connection.isInitialized) {
      await connection.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

seed();

