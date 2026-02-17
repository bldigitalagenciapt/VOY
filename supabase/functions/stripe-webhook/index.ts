import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("No signature", { status: 400 });
    }

    try {
        const body = await req.text();
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;

            if (userId) {
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        plan_status: "premium",
                        payment_date: new Date().toISOString()
                    })
                    .eq("user_id", userId);

                if (error) {
                    console.error(`Error updating profile for user ${userId}:`, error);
                    return new Response(JSON.stringify({ error: "Error updating profile", details: error }), { status: 500 });
                }

                console.log(`SUCCESS: User ${userId} upgraded to premium.`);
            } else {
                console.error("No user_id found in session.client_reference_id");
            }
        } else {
            console.log(`Received event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
});
