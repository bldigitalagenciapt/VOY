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

// IDs dos planos do Stripe
// Prioridade: variável de ambiente → fallback com ID real do produto
const PRICE_IDS = {
    monthly: Deno.env.get("STRIPE_PRICE_MONTHLY") || "price_1TErBVE9B3Qi46145xFfvUu3",
    yearly: Deno.env.get("STRIPE_PRICE_YEARLY") || "price_1TErBVE9B3Qi4614qt3qEvv4",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, user_email, plan_type } = await req.json();

        // Aceitar variações de nomes
        const isYearly = plan_type === "yearly" || plan_type === "annual";
        const priceId = isYearly ? PRICE_IDS.yearly : PRICE_IDS.monthly;
        const resolvedPlanType = isYearly ? "yearly" : "monthly";

        console.log(`[STRIPE] Plano solicitado: ${plan_type} → ${resolvedPlanType}`);
        console.log(`[STRIPE] Price ID selecionado: ${priceId}`);
        console.log(`[STRIPE] User: ${user_id} | Email: ${user_email}`);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "multibanco", "mb_way"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            allow_promotion_codes: true,
            subscription_data: {
                trial_period_days: 14,
                metadata: {
                    user_id: user_id,
                    plan_type: resolvedPlanType,
                },
            },
            success_url: `${req.headers.get("origin")}/home?success=true`,
            cancel_url: `${req.headers.get("origin")}/home?payment=cancelled`,
            customer_email: user_email,
            client_reference_id: user_id,
        });

        console.log(`[STRIPE] Sessão criada com sucesso: ${session.id}`);

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("[STRIPE] Erro ao criar sessão:", error);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
