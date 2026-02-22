const { createClient } = require('@supabase/supabase-js');

function createDb(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

module.exports = { createDb };
