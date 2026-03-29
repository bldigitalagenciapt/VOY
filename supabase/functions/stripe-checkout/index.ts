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

// Remover fallbacks hardcoded; o frontend dita o Price ID.

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, user_email, plan_type, price_id } = await req.json();

        if (!price_id) {
            throw new Error("O price_id deve ser fornecido obrigatoriamente no corpo da requisição.");
        }

        const isYearly = plan_type === "yearly" || plan_type === "annual";
        const resolvedPlanType = isYearly ? "yearly" : "monthly";

        console.log(`[STRIPE] Plano solicitado: ${plan_type} → ${resolvedPlanType}`);
        console.log(`[STRIPE] Price ID selecionado pelo cliente: ${price_id}`);
        console.log(`[STRIPE] User: ${user_id} | Email: ${user_email}`);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: price_id,
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
