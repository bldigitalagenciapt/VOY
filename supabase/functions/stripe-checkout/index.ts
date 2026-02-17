import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, user_email } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "multibanco", "mb_way"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "VOY Premium - Acesso Total Vitalício",
                            description: "Acesso ilimitado a documentos, cofre criptografado e suporte VIP.",
                        },
                        unit_amount: 1990, // 19.90€
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${req.headers.get("origin")}/home?success=true`,
            cancel_url: `${req.headers.get("origin")}/home?payment=cancelled`,
            customer_email: user_email,
            client_reference_id: user_id,
            payment_intent_data: {
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
        console.error("Stripe Checkout Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
