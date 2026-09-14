import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbId } = await req.json();

    // 1. Verify Razorpay Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET as string;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update DB to FAILED
      await supabaseAdmin
        .from("registrations")
        .update({ payment_status: "FAILED" })
        .eq("id", dbId);
        
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Generate secure QR token for the digital pass
    const secureToken = crypto.randomBytes(32).toString("hex");
    const qrToken = `BDM-PASS-${secureToken}`;

    // 3. Payment is authentic, update DB to PAID and CONFIRMED
    const { data: updatedReg, error } = await supabaseAdmin
      .from("registrations")
      .update({
        payment_status: "PAID",
        registration_status: "CONFIRMED",
        razorpay_payment_id,
        razorpay_signature,
        qr_token: qrToken,
        pass_generated: true
      })
      .eq("id", dbId)
      .select('registration_id')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ 
      success: true, 
      registrationId: updatedReg.registration_id 
    });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Server error during verification" }, { status: 500 });
  }
}
