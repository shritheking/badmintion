import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const razorpay_order_id = params.get("razorpay_order_id");
    const razorpay_payment_id = params.get("razorpay_payment_id");
    const razorpay_signature = params.get("razorpay_signature");
    
    const error_code = params.get("error[code]");
    if (error_code) {
      const url = new URL(req.url);
      return NextResponse.redirect(`${url.origin}/register?error=Payment+Failed`);
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET as string;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await supabaseAdmin
        .from("registrations")
        .update({ payment_status: "FAILED" })
        .eq("razorpay_order_id", razorpay_order_id);
        
      const url = new URL(req.url);
      return NextResponse.redirect(`${url.origin}/register?error=Invalid+Signature`);
    }

    const { data: regData, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("registration_id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !regData) throw new Error("Registration not found");

    const secureToken = crypto.randomBytes(32).toString("hex");
    const qrToken = `BDM-PASS-${secureToken}`;

    const { error } = await supabaseAdmin
      .from("registrations")
      .update({
        payment_status: "PAID",
        registration_status: "CONFIRMED",
        razorpay_payment_id,
        razorpay_signature,
        qr_token: qrToken,
        pass_generated: true
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (error) throw new Error(error.message);

    const url = new URL(req.url);
    return NextResponse.redirect(`${url.origin}/confirmation/${regData.registration_id}`);

  } catch (error: any) {
    console.error("Callback error:", error);
    const url = new URL(req.url);
    return NextResponse.redirect(`${url.origin}/register?error=Server+Error`);
  }
}