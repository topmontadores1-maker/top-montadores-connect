import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigrations() {
  try {
    console.log('🚀 Running migrations...\n');

    // Read and execute migration 1 - Create tables
    const migration1Path = path.join(process.cwd(), 'supabase', 'migrations', '001_create_tables.sql');
    const migration1SQL = fs.readFileSync(migration1Path, 'utf-8');
    
    console.log('📝 Executing migration 001_create_tables.sql...');
    const { error: error1 } = await supabase.rpc('exec', { sql: migration1SQL });
    
    if (error1) {
      console.error('❌ Migration 001 failed:', error1);
    } else {
      console.log('✅ Migration 001 completed\n');
    }

    // Read and execute migration 2 - Seed services
    const migration2Path = path.join(process.cwd(), 'supabase', 'migrations', '002_seed_services.sql');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf-8');
    
    console.log('📝 Executing migration 002_seed_services.sql...');
    const { error: error2 } = await supabase.rpc('exec', { sql: migration2SQL });
    
    if (error2) {
      console.error('❌ Migration 002 failed:', error2);
    } else {
      console.log('✅ Migration 002 completed\n');
    }

    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

runMigrations();
