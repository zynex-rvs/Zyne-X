const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xtwfrajiikkzayjzshte.supabase.co',
  'sb_publishable_lBB_TzfTrpDfCIF_wP5dwQ_ZeovBrz8'
);

async function checkSchema() {
  const { data, error } = await supabase.from('clubs').select('*').limit(1);
  if (error) {
    console.error('Error fetching clubs:', error);
  } else {
    if (data.length > 0) {
      console.log('Columns in clubs table:', Object.keys(data[0]));
    } else {
      console.log('Clubs table is empty, trying to insert an empty row to see error...');
      const { error: insErr } = await supabase.from('clubs').insert({ id: 'test' });
      console.log('Insert error:', insErr);
    }
  }
}

checkSchema();
