import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData, amount } = body;

    // 1. Generate unique registration ID (e.g. BDM-2026-0001)
    const { count } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    
    const nextId = (count || 0) + 1;
    const registrationId = `BDM-2026-${nextId.toString().padStart(4, '0')}`;

    // 2. Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: registrationId,
    };
    
    const order = await razorpay.orders.create(orderOptions);

    // 3. Insert PENDING registration in database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("registrations")
      .insert({
        registration_id: registrationId,
        full_name: formData.fullName,
        mobile: formData.mobile,
        email: "no-email@example.com",
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        category: formData.category,
        club_or_organization: formData.club || null,
        partner_name: formData.partnerName || null,
        partner_mobile: formData.partnerMobile || null,
        partner_email: formData.partnerEmail || null,
        tshirt_size: formData.tshirtSize || null,
        emergency_contact_name: formData.emergencyName || null,
        emergency_contact_number: formData.emergencyNumber || null,
        amount: amount,
        payment_status: "PENDING",
        registration_status: "PENDING",
        razorpay_order_id: order.id
      })
      .select('id')
      .single();

    if (dbError) throw new Error(dbError.message);

    // Return the order to frontend to open checkout
    return NextResponse.json({ 
      orderId: order.id, 
      amount: order.amount,
      registrationId: registrationId,
      dbId: dbData.id
    });
    
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
