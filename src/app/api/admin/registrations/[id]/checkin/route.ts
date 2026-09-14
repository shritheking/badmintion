import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // First, verify the registration exists
    const { data: reg, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("id, payment_status")
      .eq("registration_id", id)
      .single();
      
    if (fetchError || !reg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    
    // Create check-in record
    const { error: checkinError } = await supabaseAdmin
      .from("check_ins")
      .insert({
        registration_id: reg.id
      });
      
    if (checkinError) {
      // If code 23505, it means unique violation (already checked in)
      if (checkinError.code === "23505") {
        return NextResponse.json({ error: "Already checked in" }, { status: 400 });
      }
      throw new Error(checkinError.message);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}