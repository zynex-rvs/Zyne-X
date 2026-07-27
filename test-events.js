const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xtwfrajiikkzayjzshte.supabase.co',
  'sb_publishable_lBB_TzfTrpDfCIF_wP5dwQ_ZeovBrz8'
);

async function checkEvents() {
  const { data, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkEvents();
