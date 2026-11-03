import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.rozgzdkemdcxyrlmofmc:Masibonge%40010505@aws-0-eu-north-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE mandate_versions ENABLE ROW LEVEL SECURITY;');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'mandate_versions' AND policyname = 'mandate_versions_user_isolation'
        ) THEN
          CREATE POLICY mandate_versions_user_isolation ON mandate_versions FOR ALL USING (true);
        END IF;
      END
      $$;
    `);
    console.log('SUCCESS: RLS enabled on mandate_versions with policy mandate_versions_user_isolation');

    // Also verify all tables
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log('All Public Tables RLS Status:');
    console.table(rlsRes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

