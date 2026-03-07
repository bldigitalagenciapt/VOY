import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        // 1. Get documents expiring in 30, 7, or 1 days
        const { data: docs, error } = await supabase
            .from("documents")
            .select("*, profiles(email, language)")
            .not("expiry_date", "is", null);

        if (error) throw error;

        const today = new Date();
        const alerts = [];

        for (const doc of docs) {
            const expiry = new Date(doc.expiry_date);
            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 30 || diffDays === 7 || diffDays === 1) {
                alerts.push({
                    email: doc.profiles.email,
                    lang: doc.profiles.language || 'pt',
                    docName: doc.title,
                    days: diffDays
                });
            }
        }

        // 2. Logic to send emails (using Resend or similar if configured)
        // For now, we'll log it and mark it as 'sent' in a hypothetical notifications table
        console.log(`Found ${alerts.length} documents needing alerts.`);

        for (const alert of alerts) {
            const title = alert.lang === 'pt' ? 'Documento a Vencer' : 'Document Expiring';
            const msg = alert.lang === 'pt'
                ? `O seu documento "${alert.docName}" expira em ${alert.days} dias.`
                : `Your document "${alert.docName}" expires in ${alert.days} days.`;

            await supabase.from("notifications").insert({
                user_id: docs.find(d => d.profiles.email === alert.email).user_id,
                title: title,
                message: msg,
                type: 'alert'
            });
        }

        return new Response(JSON.stringify({ success: true, alerted: alerts.length }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
