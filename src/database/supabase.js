const { createClient } = require("@supabase/supabase-js");
const { fetch, Agent } = require("undici");

const ipv4Dispatcher = new Agent({
  connect: {
    family: 4,
  },
});

function ipv4Fetch(input, init = {}) {
  return fetch(input, {
    ...init,
    dispatcher: ipv4Dispatcher,
  });
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: ipv4Fetch,
    },
  },
);

module.exports = supabase;
