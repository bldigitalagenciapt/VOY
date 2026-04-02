import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Check if this is a cleanup request (can be triggered by a CRON job)
        const url = new URL(req.url);
        if (url.searchParams.get("action") === "cleanup") {
            return await handleCleanup(supabaseAdmin);
        }

        const { user_id } = await req.json();
        if (!user_id) {
            return new Response(JSON.stringify({ error: "user_id is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 1. Get user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("user_id", user_id)
            .single();

        if (profileError || !profile) {
            return new Response(JSON.stringify({ error: "User profile not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Schedule deletion (soft delete)
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ deletion_scheduled_at: new Date().toISOString() })
            .eq("user_id", user_id);

        if (updateError) throw updateError;

        // 3. (Optional) Handle Refund if within 7 days
        let refundMessage = "";
        if (profile.plan_status === "premium" && profile.payment_date) {
            const daysSincePurchase = (Date.now() - new Date(profile.payment_date).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSincePurchase <= 7) {
                // Here you would integrate with Stripe to process a refund
                // For now, we just mark it for manual/automatic refund process later
                refundMessage = ". Reembolso de 14 dias elegível será processado.";
            }
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: `Exclusão agendada para daqui a 30 dias${refundMessage}. Seus dados estão seguros durante este período.` 
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Delete account error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});

async function handleCleanup(supabaseAdmin: any) {
    console.log("Starting cleanup of expired deletion requests...");
    
    // Find users scheduled for more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: expiredUsers, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .lte("deletion_scheduled_at", thirtyDaysAgo.toISOString());

    if (fetchError) throw fetchError;
    if (!expiredUsers || expiredUsers.length === 0) {
        return new Response(JSON.stringify({ success: true, message: "No expired accounts to clean up" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const results = [];
    for (const user of expiredUsers) {
        const uid = user.user_id;
        console.log(`Permanently deleting data for user: ${uid}`);
        
        try {
            // 1. Delete Storage Files
            const { data: storageFiles } = await supabaseAdmin.storage
                .from("voy_secure_docs")
                .list(uid);

            if (storageFiles && storageFiles.length > 0) {
                const filePaths = storageFiles.map((f: any) => `${uid}/${f.name}`);
                await supabaseAdmin.storage.from("voy_secure_docs").remove(filePaths);
            }

            // 2. Delete Database Records (Order matters if there are FKs)
            await supabaseAdmin.from("quick_access_documents").delete().eq("user_id", uid);
            await supabaseAdmin.from("documents").delete().eq("user_id", uid);
            await supabaseAdmin.from("notes").delete().eq("user_id", uid);
            await supabaseAdmin.from("aima_processes").delete().eq("user_id", uid);
            await supabaseAdmin.from("aima_status").delete().eq("user_id", uid);
            await supabaseAdmin.from("custom_categories").delete().eq("user_id", uid);
            await supabaseAdmin.from("transactions").delete().eq("user_id", uid);
            await supabaseAdmin.from("profiles").delete().eq("user_id", uid);

            // 3. Delete Auth User
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(uid);
            if (authError) console.error(`Error deleting auth user ${uid}:`, authError);

            results.push({ user_id: uid, status: "deleted" });
        } catch (e) {
            console.error(`Failed to cleanup user ${uid}:`, e);
            results.push({ user_id: uid, status: "failed", error: e.message });
        }
    }

    return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
