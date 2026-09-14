import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // First delete any check-ins associated with this registration to satisfy foreign key constraints
    await supabaseAdmin.from("check_ins").delete().eq("registration_id", id);
    
    // Then delete the registration
    const { error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("registration_id", id);
      
    if (error) throw new Error(error.message);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}