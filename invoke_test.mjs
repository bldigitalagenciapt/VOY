import fs from 'fs';

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            let val = values.join('=').trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            env[key.trim()] = val;
        }
    }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function main() {
    const email = 'teste@voyapp.com';
    const password = 'TestePassword123!';

    let res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({ email, password })
    });
    let data = await res.json();
    if (!res.ok) {
        console.error('Sign in error:', data);
        return;
    }

    const session = data;

    console.log('Invoking stripe-checkout function with BOTH apikey and Authorization...');
    const invokeRes = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({
            user_id: session.user.id,
            user_email: session.user.email,
            plan_type: 'monthly',
            price_id: 'price_1TErBVE9B3Qi46145xFfvUu3'
        })
    });

    console.log('Status:', invokeRes.status);
    const body = await invokeRes.text();
    console.log('Response body:', body);
}

main();
