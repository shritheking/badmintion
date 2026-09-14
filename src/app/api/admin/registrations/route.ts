import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*, check_ins(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Generate secure QR token for the digital pass
    const secureToken = crypto.randomBytes(32).toString("hex");
    const qrToken = `BDM-PASS-${secureToken}`;
    
    // Generate registration ID
    const { count } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    
    const nextId = (count || 0) + 1;
    const registrationId = `BDM-2026-${nextId.toString().padStart(4, '0')}`;

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        registration_id: registrationId,
        full_name: body.full_name,
        mobile: body.mobile,
        email: body.email || "no-email@example.com",
        date_of_birth: body.date_of_birth,
        gender: "Male",
        address: "N/A",
        city: body.city || "N/A",
        state: "N/A",
        category: "Men's Doubles",
        club_or_organization: body.club_or_organization || null,
        partner_name: body.partner_name || null,
        partner_mobile: body.partner_mobile || null,
        partner_email: null,
        amount: body.amount || 800,
        payment_status: "PAID",
        registration_status: "CONFIRMED",
        razorpay_order_id: "MANUAL-" + crypto.randomBytes(4).toString("hex"),
        razorpay_payment_id: "CASH",
        razorpay_signature: "MANUAL",
        qr_token: qrToken,
        pass_generated: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error("This mobile number or email is already registered.");
      }
      throw new Error(error.message);
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Manual add error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
