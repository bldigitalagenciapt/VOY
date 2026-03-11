import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, user_email, plan_type } = await req.json();

        // Determinar o ID do preço baseado no tipo de plano
        // Se price_id vir diretamente do frontend, usamos ele. 
        // Caso contrário, usamos as variáveis de ambiente.
        const priceId = plan_type === 'yearly'
            ? Deno.env.get("STRIPE_PRICE_YEARLY")
            : Deno.env.get("STRIPE_PRICE_MONTHLY");

        if (!priceId) {
            console.error("Price ID not configured for plan:", plan_type);
            // Fallback para log ou erro amigável se necessário
        }

        console.log(`[DEBUG] Creating checkout session for user ${user_id}, plan: ${plan_type}, priceId: ${priceId}`);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "multibanco", "mb_way"],
            line_items: [
                {
                    price: priceId, // Usando Price ID do Stripe Dashboard
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${req.headers.get("origin")}/home?success=true`,
            cancel_url: `${req.headers.get("origin")}/home?payment=cancelled`,
            customer_email: user_email,
            client_reference_id: user_id,
            subscription_data: {
                metadata: {
                    user_id: user_id,
                },
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Stripe Checkout Error:", error);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
