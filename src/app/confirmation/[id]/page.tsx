import Link from "next/link";
import { CheckCircle2, Download, ArrowRight, Ticket } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const { data: registration, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("registration_id", params.id)
    .single();

  if (error || !registration) {
    notFound();
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-3 font-sans">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl overflow-hidden border">
        
        {/* Success Header */}
        <div className="bg-[#22c55e] p-6 text-white text-center">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold mb-1">Registration<br/>Successful 🎉</h1>
          <p className="text-green-50 text-xs font-medium px-4">
            Thank you for registering for the tournament!
          </p>
        </div>
        
        {/* Registration Details */}
        <div className="p-5">
          <div className="space-y-3">
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-xs font-medium">Registration ID</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{registration.registration_id}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-xs font-medium">Player Name</span>
              <span className="font-bold text-slate-900 text-sm">{registration.full_name}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-xs font-medium">Category</span>
              <span className="font-bold text-slate-900 text-sm">{registration.category}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-xs font-medium">Payment Amount</span>
              <span className="font-bold text-slate-900 text-sm">₹{registration.amount}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-xs font-medium">Payment Status</span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                {registration.payment_status}
              </span>
            </div>

          </div>

          <div className="mt-6 space-y-3">
            <Link 
              href={`/pass/${registration.registration_id}`}
              className="w-full flex items-center justify-center h-12 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors text-sm"
            >
              <Ticket className="mr-2 h-4 w-4" />
              View Digital Pass
            </Link>
            
            <Link 
              href="/"
              className="w-full flex items-center justify-center h-12 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
