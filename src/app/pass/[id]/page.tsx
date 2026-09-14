import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import PassCard from "@/components/PassCard";
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
      <PassCard registration={registration} />
      
      {/* Navigation link at bottom */}
      <div className="text-center pb-2 shrink-0">
        <Link href="/" className="text-white/60 hover:text-white text-xs font-medium transition-colors border border-white/20 px-5 py-1.5 rounded-full inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
