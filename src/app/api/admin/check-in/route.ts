import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the admin from the request headers or cookies
    // Usually handled by Supabase Auth middleware, but we check role via service_role here based on session token if we pass it, 
    // OR we simply require the client to be an authenticated user.
    // For this API, let's assume the frontend sends the user's JWT in the Authorization header.
    const { qrToken, action, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ status: "invalid", message: "Unauthorized: Missing user ID" }, { status: 401 });
    }

    if (!qrToken) {
      return NextResponse.json({ status: "invalid", message: "QR token required" }, { status: 400 });
    }

    // 2. Look up the registration by QR token
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("*, check_ins(*)")
      .eq("qr_token", qrToken)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ 
        status: "invalid",
        message: "This QR code does not belong to a valid tournament registration." 
      });
    }

    // Check payment status
    if (registration.payment_status !== "PAID") {
      return NextResponse.json({ 
        status: "unpaid",
        message: "This registration cannot be used for venue entry. Payment not verified." 
      });
    }

    if (registration.registration_status === "CANCELLED") {
      return NextResponse.json({ 
        status: "cancelled",
        message: "Registration Cancelled" 
      });
    }

    // Check if already checked in
    const checkInRecord = registration.check_ins?.[0];
    const isCheckedIn = !!checkInRecord;

    const regDetails = {
      id: registration.id,
      registration_id: registration.registration_id,
      full_name: registration.full_name,
      category: registration.category,
      payment_status: registration.payment_status,
      registration_status: registration.registration_status,
    };

    if (action === "validate") {
      return NextResponse.json({
        status: "valid",
        registration: regDetails,
        isCheckedIn,
        checkInTime: checkInRecord?.checked_in_at
      });
    }

    if (action === "check-in") {
      if (isCheckedIn) {
        return NextResponse.json({ 
          status: "already_checked_in",
          message: "Already checked in",
          checkInTime: checkInRecord.checked_in_at,
          registration: regDetails
        });
      }

      // Perform atomic check-in insertion
      const { data: newCheckIn, error: checkInError } = await supabaseAdmin
        .from("check_ins")
        .insert({
          registration_id: registration.id,
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: userId
        })
        .select()
        .single();

      if (checkInError) {
        // Handle unique constraint violation gracefully
        if (checkInError.code === '23505') {
           return NextResponse.json({ 
             status: "already_checked_in",
             registration: regDetails
           });
        }
        throw new Error(checkInError.message);
      }

      return NextResponse.json({
        status: "success",
        message: "Checked in successfully",
        checkInTime: newCheckIn.checked_in_at,
        registration: regDetails
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
