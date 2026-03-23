const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...values] = line.split('=');
    if (key && values.length) acc[key.trim()] = values.join('=').trim();
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const tId = '7fad97a6-432e-4aa4-b7a9-8dff29ef5bf1';
    // Send a partial object
    const { data, error } = await supabase
        .from('tenants')
        .update({ knowledge_base: { "TestKey": "TestValue" } })
        .eq('id', tId)
        .select('knowledge_base');

    console.log("After update:");
    console.log(JSON.stringify(data, null, 2));
}

test().then(() => process.exit(0)).catch(console.error);
