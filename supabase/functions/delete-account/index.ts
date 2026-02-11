import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { user_id } = await req.json();
        if (!user_id) {
            return new Response(JSON.stringify({ error: "user_id is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        // 1. Verify the user exists and is within refund period (7 days)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("plan_status, payment_date")
            .eq("user_id", user_id)
            .single();

        if (profileError || !profile) {
            return new Response(JSON.stringify({ error: "User profile not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        if (profile.plan_status !== "premium" || !profile.payment_date) {
            return new Response(JSON.stringify({ error: "No active premium subscription to refund" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        const daysSincePurchase = (Date.now() - new Date(profile.payment_date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePurchase > 7) {
            return new Response(JSON.stringify({ error: "Refund period has expired (7 days)" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        // 2. Delete all user files from storage
        const { data: storageFiles } = await supabaseAdmin.storage
            .from("voy_secure_docs")
            .list(user_id);

        if (storageFiles && storageFiles.length > 0) {
            const filePaths = storageFiles.map((f: { name: string }) => `${user_id}/${f.name}`);
            await supabaseAdmin.storage.from("voy_secure_docs").remove(filePaths);
        }

        // 3. Delete all user data from database tables
        await supabaseAdmin.from("documents").delete().eq("user_id", user_id);
        await supabaseAdmin.from("notes").delete().eq("user_id", user_id);
        await supabaseAdmin.from("aima_status").delete().eq("user_id", user_id);
        await supabaseAdmin.from("transactions").delete().eq("user_id", user_id);
        await supabaseAdmin.from("profiles").delete().eq("user_id", user_id);

        // 4. Delete the auth user (this completely removes the account)
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (deleteAuthError) {
            console.error("Error deleting auth user:", deleteAuthError);
            // Continue even if this fails — data is already gone
        }

        return new Response(
            JSON.stringify({ success: true, message: "Account and all data permanently deleted" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            }
        );
    } catch (error) {
        console.error("Delete account error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
});
