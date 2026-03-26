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
        console.log("[WEBHOOK] Recebido webhook. Assinatura:", signature ? "Presente" : "Ausente");

        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
        );

        console.log(`[WEBHOOK] Evento construído: ${event.type}`);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const customerEmail = session.customer_details?.email;

            console.log(`[WEBHOOK] Processando checkout.session.completed. userId: ${userId}, email: ${customerEmail}`);

            if (userId) {
                // Determinar o tipo de plano baseado no Price ID utilizado
                let planType = "monthly";
                try {
                    const monthlyPriceId = Deno.env.get("STRIPE_PRICE_MONTHLY");
                    const yearlyPriceId = Deno.env.get("STRIPE_PRICE_YEARLY");

                    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
                    const priceId = lineItems.data[0]?.price?.id;

                    console.log(`[WEBHOOK] Price ID utilizado: ${priceId}. Mensal: ${monthlyPriceId}, Anual: ${yearlyPriceId}`);

                    if (priceId && priceId === yearlyPriceId) {
                        planType = "yearly";
                    } else if (priceId && priceId === monthlyPriceId) {
                        planType = "monthly";
                    } else if (session.metadata?.plan_type) {
                        planType = session.metadata.plan_type;
                    }
                } catch (lineItemsError) {
                    console.warn("[WEBHOOK] Não foi possível buscar line items. Usando plano padrão 'monthly':", lineItemsError);
                }

                console.log(`[WEBHOOK] Tipo de plano: ${planType}. Atualizando perfil do user ${userId}...`);

                const { data, error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        plan_status: "premium",
                        plan_type: planType,
                        payment_date: new Date().toISOString()
                    })
                    .eq("user_id", userId)
                    .select();

                if (error) {
                    console.error(`[WEBHOOK] ERRO ao atualizar perfil do user ${userId}:`, error);
                    return new Response(JSON.stringify({ error: "Error updating profile", details: error }), { status: 500 });
                }

                if (!data || data.length === 0) {
                    console.warn(`[WEBHOOK] AVISO: Nenhum perfil encontrado para o user ${userId}.`);
                } else {
                    console.log(`[WEBHOOK] SUCESSO: User ${userId} é agora premium com plano ${planType}.`);
                }
            } else {
                console.error("[WEBHOOK] ABORTADO: Nenhum user_id em session.client_reference_id");
            }
        } else if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            console.log(`[WEBHOOK] Processando customer.subscription.deleted para customer: ${customerId}`);

            const { data, error } = await supabaseAdmin
                .from("profiles")
                .update({ plan_status: "free", plan_type: null })
                .eq("stripe_customer_id", customerId)
                .select();

            if (error) console.error(`[WEBHOOK] Erro ao resetar plano do customer ${customerId}:`, error);
            else console.log(`[WEBHOOK] Assinatura cancelada. Plano resetado para free. Customer: ${customerId}`);

        } else {
            console.log(`[WEBHOOK] Evento ignorado: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error(`[WEBHOOK] ERRO CRÍTICO: ${errorMessage}`);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
    }
});
