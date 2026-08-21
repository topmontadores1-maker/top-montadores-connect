#!/usr/bin/env node
/**
 * Initialize database tables and seed initial data
 * Run with: npm exec -- node scripts/init-db.mjs
 */

import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function execSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ SQL execution failed:', error.message);
    throw error;
  }
}

async function initDB() {
  console.log('🚀 Initializing database...\n');

  try {
    // We'll use Supabase REST API to insert data
    // But tables must be created via Supabase Dashboard or CLI
    console.log('📝 Please create these tables manually in Supabase Dashboard:\n');
    console.log('1. Run the SQL from: supabase/migrations/001_create_tables.sql');
    console.log('2. Run the SQL from: supabase/migrations/002_seed_services.sql\n');
    
    console.log('Or run via Supabase CLI:');
    console.log('  supabase db push\n');
    
    console.log('✨ Once tables are created, run this script to seed data.');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

initDB();
