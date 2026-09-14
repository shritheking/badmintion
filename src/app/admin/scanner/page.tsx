"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminScanner() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setSession(session);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!session || !scannerActive) return;
    
    // Prevent double initialization in React Strict Mode
    if (scannerRef.current) return;

    // Initialize scanner
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      async (decodedText) => {
        // Stop scanning after successful read to prevent rapid-fire requests
        setScannerActive(false);
        try {
          await html5QrCode.stop();
          html5QrCode.clear();
          scannerRef.current = null;
        } catch (err) {
          console.error("Failed to stop scanner", err);
        }
        await processScan(decodedText);
      },
      (errorMessage) => {
        // ignore continuous scan errors
      }
    ).catch((err) => {
      console.error("Error starting scanner:", err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(console.error);
      }
    };
  }, [session, scannerActive]);

  const processScan = async (qrToken: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ qrToken, action: "check-in", userId: session?.user?.id }) // passing userId directly
      });

      const data = await response.json();
      setScanResult({ ...data, qrToken });
    } catch (error) {
      console.error(error);
      setScanResult({ status: "error", message: "Network error during validation" });
    }
    setLoading(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setScannerActive(true);
  };

  if (!session) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Authenticating...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="p-4 flex items-center border-b border-slate-800">
        <Link href="/admin/dashboard" className="mr-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-lg tracking-wide">QR Check-in Scanner</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative min-h-[400px] flex flex-col">
          
          {loading && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="font-medium text-slate-300">Processing...</p>
            </div>
          )}

          {scannerActive && !scanResult && (
            <div className="flex-1 flex flex-col bg-black">
              <div id="qr-reader" className="w-full h-full border-none! [&_video]:object-cover" />
              <div className="bg-slate-800 p-4 text-center">
                <p className="text-sm text-slate-400">Point camera at player QR code</p>
              </div>
            </div>
          )}

          {scanResult && !scannerActive && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              {scanResult.status === "success" && (
                <div className="w-full space-y-6">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">PRESENT</h2>
                    <p className="font-mono text-slate-400">{scanResult.registration?.registration_id}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 text-left text-sm">
                    <p><span className="text-slate-500">Player:</span> <span className="font-bold text-white">{scanResult.registration?.full_name}</span></p>
                    <p><span className="text-slate-500">Category:</span> <span className="font-bold text-white">{scanResult.registration?.category}</span></p>
                    <p><span className="text-slate-500">Payment:</span> <span className="text-green-500 font-bold">{scanResult.registration?.payment_status}</span></p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Checked in successfully at {new Date(scanResult.checkInTime).toLocaleString()}</p>
                </div>
              )}

              {scanResult.status === "already_checked_in" && (
                <div className="w-full space-y-6">
                  <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">ALREADY CHECKED IN</h2>
                    <p className="text-slate-400">This pass was already scanned at:</p>
                    <p className="text-sm font-bold text-yellow-500 mt-2">{new Date(scanResult.checkInTime).toLocaleString()}</p>
                  </div>
                  {scanResult.registration && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 text-left text-sm">
                      <p><span className="text-slate-500">Player:</span> <span className="font-bold text-white">{scanResult.registration?.full_name}</span></p>
                      <p><span className="text-slate-500">Category:</span> <span className="font-bold text-white">{scanResult.registration?.category}</span></p>
                    </div>
                  )}
                </div>
              )}

              {(scanResult.status === "invalid" || scanResult.status === "unpaid" || scanResult.status === "cancelled") && (
                <div className="w-full space-y-6">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">INVALID PASS</h2>
                    <p className="text-slate-400">{scanResult.message}</p>
                  </div>
                </div>
              )}

              <button onClick={resetScanner} className="mt-8 w-full h-12 bg-primary rounded-xl font-bold text-white shadow hover:bg-primary/90 transition-colors tracking-wider">
                SCAN NEXT PASS
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
