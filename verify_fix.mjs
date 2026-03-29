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
    console.log('--- TESTE DE VERIFICAÇÃO DE AUTH ---');
    const email = 'teste@voyapp.com';
    const password = 'TestePassword123!';

    console.log('1. Autenticando com usuário de teste...');
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError) {
        console.error('Erro ao logar:', signInError);
        return;
    }
    console.log('Sucesso ao logar! User ID:', session.user.id);

    console.log('2. Invocando stripe-checkout (modo SDK padrão)...');
    // Note: O SDK cuidará dos cabeçalhos automaticamente
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
            user_id: session.user.id,
            user_email: session.user.email,
            plan_type: 'monthly',
            price_id: 'price_1TErBVE9B3Qi46145xFfvUu3'
        }
    });

    if (error) {
        console.error('A função retornou um erro (isso pode ser esperado se faltarem Secrets no painel):');
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        
        if (error.message.includes('Invalid JWT')) {
            console.error('❌ ERRO: O problema de "Invalid JWT" ainda persiste.');
        } else {
            console.log('✅ SUCESSO DE AUTH: A falha de JWT foi resolvida. O erro atual parece ser lógico ou de configuração de Secrets (Stripe).');
        }
    } else {
        console.log('✅ SUCESSO TOTAL: A função retornou com sucesso!');
        console.log('URL de Checkout:', data?.url);
    }
}

main();
