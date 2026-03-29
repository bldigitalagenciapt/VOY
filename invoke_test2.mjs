import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function main() {
    const email = 'teste@voyapp.com';
    const password = 'TestePassword123!';

    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError) {
        console.error('Sign in error:', signInError);
        return;
    }

    console.log('Invoking stripe-checkout function with NO manual headers (supabase-js auto-inject)...');
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
            user_id: session.user.id,
            user_email: session.user.email,
            plan_type: 'monthly',
            price_id: 'price_1TErBVE9B3Qi46145xFfvUu3'
        }
    });

    if (error) {
        console.error('Invoke Error:', error);
        
        if (error.context && error.context.json) {
            try {
                const errorBody = await error.context.json();
                console.error('Error body:', errorBody);
            } catch (e) {
                console.log('Could not parse error context json');
            }
        } else {
           console.log("No error context or context json");
        }
    } else {
        console.log('Success Data:', data);
    }
}

main();
