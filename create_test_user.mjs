import fs from 'fs';

// Read .env file manually to avoid dotenv dependency
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

if(!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

async function main() {
    const email = 'teste@voyapp.com';
    const password = 'TestePassword123!';

    console.log('Signing up user...');
    
    // 1. Sign up user via REST API
    let res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({ email, password })
    });
    
    let data = await res.json();
    
    if (!res.ok) {
        if (data.msg?.includes('User already registered') || data.message?.includes('already registered')) {
            console.log('User might already exist. Signing in instead...');
            res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_PUBLISHABLE_KEY
                },
                body: JSON.stringify({ email, password })
            });
            data = await res.json();
            if (!res.ok) {
                console.error('Sign in error:', data);
                return;
            }
        } else {
            console.error('Signup error:', data);
            return;
        }
    }

    const user = data.user;
    const session = data.session || data; // depending on endpoint
    
    console.log('User ID:', user?.id);

    if(!user || !session?.access_token) {
        console.log('Signup succeeded but user or token is missing (might require email confirmation).');
        console.log('Data:', data);
        return;
    }

    // 2. Grant premium status via REST API (update profile)
    console.log('Attempting to update profile to premium...');
    
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ 
            plan_status: 'premium',
            display_name: 'Usuário Teste'
        })
    });

    if (!profileRes.ok) {
        const errorData = await profileRes.json();
        console.error('Failed to update profile:', errorData);
    } else {
        const updatedData = await profileRes.json();
        console.log('Profile successfully updated to premium!');
        console.log(updatedData);
    }
    
    console.log('Done.');
}

main();
