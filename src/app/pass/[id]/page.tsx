import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Trophy, CalendarDays, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function PassPage({ params }: { params: { id: string } }) {
  const { data: registration, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("registration_id", params.id)
    .single();

  if (error || !registration || !registration.pass_generated) {
    notFound();
  }

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-3 font-sans">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative mb-4 shrink-0">
        
        {/* Ticket Header */}
        <div className="bg-white p-4 text-center rounded-t-2xl relative border-b border-slate-100">
          <img src="/logo.png" alt="SMASHPRO" className="h-10 mx-auto" />
        </div>
        
        {/* Pass Info */}
        <div className="p-4 pb-2 text-center">
          <h2 className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">DIGITAL ENTRY PASS</h2>
          <div className="my-2 space-y-0.5">
            <h3 className="text-xl font-black text-slate-900 leading-tight">{registration.full_name}</h3>
            <p className="text-sm font-semibold text-primary">{registration.category}</p>
          </div>
          
          <div className="inline-block bg-slate-100 rounded-md px-3 py-1 font-mono text-xs font-bold text-slate-600 mb-3 border border-slate-200">
            {registration.registration_id}
          </div>

          <QRCodeDisplay 
            token={registration.qr_token} 
            name={registration.full_name} 
            category={registration.category}
            registrationId={registration.registration_id}
          />
        </div>
        
        {/* Status Area */}
        <div className="bg-slate-50 border-t border-dashed border-slate-300 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Payment</span>
              <span className="flex items-center text-green-600 font-bold">
                <CheckCircle2 className="h-3 w-3 mr-1" /> VERIFIED
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Registration</span>
              <span className="flex items-center text-green-600 font-bold">
                <CheckCircle2 className="h-3 w-3 mr-1" /> CONFIRMED
              </span>
            </div>
          </div>
        </div>

      </div>
      
      {/* Navigation link at bottom */}
      <div className="text-center pb-2 shrink-0">
        <Link href="/" className="text-white/60 hover:text-white text-xs font-medium transition-colors border border-white/20 px-5 py-1.5 rounded-full inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
