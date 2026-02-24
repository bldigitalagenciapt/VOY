import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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

Deno.serve(async (req: Request) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("No signature", { status: 400 });
    }

    try {
        const body = await req.text();
        console.log("[WEBHOOK] Received webhook request. Signature:", signature ? "Present" : "Missing");

        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
        );

        console.log(`[WEBHOOK] Event constructed: ${event.type}`);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const customerEmail = session.customer_details?.email;

            console.log(`[WEBHOOK] Processing checkout.session.completed. userId: ${userId}, email: ${customerEmail}`);

            if (userId) {
                console.log(`[WEBHOOK] Attempting to update profile for user ${userId} to premium...`);

                const { data, error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        plan_status: "premium",
                        payment_date: new Date().toISOString()
                    })
                    .eq("user_id", userId)
                    .select();

                if (error) {
                    console.error(`[WEBHOOK] ERROR updating profile for user ${userId}:`, error);
                    return new Response(JSON.stringify({ error: "Error updating profile", details: error }), { status: 500 });
                }

                if (!data || data.length === 0) {
                    console.warn(`[WEBHOOK] WARNING: No profile found for user ${userId}. Status update skipped.`);
                } else {
                    console.log(`[WEBHOOK] SUCCESS: User ${userId} upgraded to premium. Row(s) updated:`, data.length);
                }
            } else {
                console.error("[WEBHOOK] ABORT: No user_id found in session.client_reference_id");
            }
        } else {
            console.log(`[WEBHOOK] Ignored event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error(`[WEBHOOK] CRITICAL ERROR: ${errorMessage}`);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
    }
});
