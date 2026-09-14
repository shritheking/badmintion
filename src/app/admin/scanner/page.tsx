"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, Camera, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function AdminScanner() {
  const router = useRouter();
  
  // App state
  const [session, setSession] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  
  // Camera state
  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "error" | "denied">("loading");
  const [cameraErrorMsg, setCameraErrorMsg] = useState("");
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(true); // Use ref for instantaneous state checks in callback

  // 1. Immediately start camera initialization on mount
  useEffect(() => {
    // Start camera immediately
    initializeCamera();

    // Authenticate in background
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setSession(session);
      }
    });

    return () => {
      stopCamera();
    };
  }, [router]);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping camera", err);
      }
      scannerRef.current = null;
    }
  };

  const initializeCamera = async (preferredDeviceId?: string) => {
    setCameraStatus("loading");
    setCameraErrorMsg("");
    isScanningRef.current = true;

    try {
      // Get all cameras
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        setDevices(cameras);
        
        // Pick the camera: preferred -> last used -> back camera -> first available
        let targetDeviceId = preferredDeviceId;
        if (!targetDeviceId) {
          const savedId = localStorage.getItem("lastCameraId");
          if (savedId && cameras.find(c => c.id === savedId)) {
            targetDeviceId = savedId;
          } else {
            // Try to find a back camera
            const backCamera = cameras.find(c => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("environment"));
            targetDeviceId = backCamera ? backCamera.id : cameras[0].id;
          }
        }

        setActiveCameraId(targetDeviceId!);
        localStorage.setItem("lastCameraId", targetDeviceId!);

        await startScanner(targetDeviceId!);
      } else {
        setCameraStatus("error");
        setCameraErrorMsg("No cameras found on this device.");
      }
    } catch (err: any) {
      console.error("Camera permission or initialization error:", err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("permission")) {
        setCameraStatus("denied");
      } else {
        setCameraStatus("error");
        setCameraErrorMsg("Unable to start camera. Check permissions.");
      }
    }
  };

  const startScanner = async (deviceId: string) => {
    // Clean up existing scanner if any
    await stopCamera();

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        deviceId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        async (decodedText) => {
          // If we are already processing a scan, ignore rapid-fire duplicates
          if (!isScanningRef.current) return;
          
          // Pause logical scanning, but leave camera running
          isScanningRef.current = false;
          await processScan(decodedText);
        },
        () => {
          // Ignore continuous detection errors
        }
      );
      setCameraStatus("ready");
    } catch (err: any) {
      console.error("Error starting scanner feed:", err);
      setCameraStatus("error");
      setCameraErrorMsg("Unable to start camera feed.");
    }
  };

  const flipCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % devices.length;
    initializeCamera(devices[nextIndex].id);
  };

  const processScan = async (qrToken: string) => {
    setLoadingResult(true);
    setScanResult(null);
    try {
      // In case session isn't loaded yet, wait for it
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify({ qrToken, action: "check-in", userId: currentSession?.user?.id })
      });

      const data = await response.json();
      setScanResult({ ...data, qrToken });
    } catch (error) {
      console.error(error);
      setScanResult({ status: "error", message: "Network error during validation" });
    }
    setLoadingResult(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    isScanningRef.current = true;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-primary/30">
      <header className="p-4 flex items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/admin/dashboard" className="mr-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-lg tracking-wide">QR Scanner</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-lg mx-auto">
        <div className="w-full bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col aspect-[3/4] sm:aspect-auto sm:min-h-[600px]">
          
          {/* CAMERA VIEWPORT - Reserves space immediately */}
          <div className="flex-1 relative bg-black flex flex-col w-full h-full">
            
            {/* The actual video container */}
            <div id="qr-reader" className="absolute inset-0 w-full h-full border-none! [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

            {/* Loading State Overlay */}
            {cameraStatus === "loading" && (
              <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                  <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-lg">Starting camera...</p>
                  <p className="text-sm text-slate-400 px-6">Allow camera access to scan player passes</p>
                </div>
              </div>
            )}

            {/* Error States Overlay */}
            {cameraStatus === "denied" && (
              <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center space-y-4 px-6 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p className="font-bold text-lg">Camera Access Required</p>
                <p className="text-sm text-slate-400">Please allow camera access in your browser settings to scan player passes.</p>
                <button onClick={() => initializeCamera()} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition">
                  Try Again
                </button>
              </div>
            )}

            {cameraStatus === "error" && (
              <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center space-y-4 px-6 text-center">
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="font-bold text-lg">Unable to start camera</p>
                <p className="text-sm text-slate-400">{cameraErrorMsg || "Check your browser permissions and try again."}</p>
                <button onClick={() => initializeCamera()} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition">
                  Try Again
                </button>
              </div>
            )}

            {/* Scanning Overlay UI (Target Box) */}
            {cameraStatus === "ready" && !scanResult && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Dark overlay with transparent center cut-out */}
                <div className="absolute inset-0 bg-black/40" style={{ clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 15% 25%, 85% 25%, 85% 75%, 15% 75%, 15% 25%)" }}></div>
                
                {/* Center target box */}
                <div className="absolute top-1/4 left-[15%] right-[15%] bottom-1/4 border-2 border-white/20 rounded-2xl flex items-center justify-center">
                  {/* Four corner brackets */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                  
                  {/* Animated scanning line */}
                  <div className="w-full h-0.5 bg-primary/80 absolute shadow-[0_0_8px_2px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: '50%' }}>
                    <style jsx>{`
                      @keyframes scan {
                        0% { top: 5%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 95%; opacity: 0; }
                      }
                    `}</style>
                  </div>
                </div>

                {/* Status Text overlay */}
                <div className="absolute bottom-8 left-0 right-0 text-center space-y-1">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-medium text-sm">
                    {loadingResult ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying pass...</span>
                    ) : (
                      "Ready to scan"
                    )}
                  </div>
                  <p className="text-xs text-white/70">Point the camera at the player's QR pass</p>
                </div>
              </div>
            )}
            
            {/* Camera Controls (Flip Camera) */}
            {cameraStatus === "ready" && devices.length > 1 && !scanResult && (
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={flipCamera}
                  className="h-10 w-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
                  title="Flip Camera"
                >
                  <RefreshCcw className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* RESULTS OVERLAY - Opaque layer covering camera feed while keeping camera running behind */}
            {scanResult && (
              <div className="absolute inset-0 z-30 bg-slate-900 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex-1 flex flex-col justify-center">
                  {scanResult.status === "success" && (
                    <div className="w-full space-y-5 text-center">
                      <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Check-in Successful</h2>
                        <p className="font-mono text-slate-400 text-sm">{scanResult.registration?.registration_id}</p>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3 text-left">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Player</p>
                          <p className="font-bold text-lg text-white">{scanResult.registration?.full_name}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Category</p>
                            <p className="font-medium text-white">{scanResult.registration?.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Payment</p>
                            <p className="font-bold text-green-400">{scanResult.registration?.payment_status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {scanResult.status === "already_checked_in" && (
                    <div className="w-full space-y-5 text-center">
                      <div className="h-20 w-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-12 w-12 text-yellow-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Already Checked In</h2>
                        <p className="text-sm font-medium text-yellow-500">Checked in at {new Date(scanResult.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      {scanResult.registration && (
                        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3 text-left">
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Player</p>
                            <p className="font-bold text-lg text-white">{scanResult.registration?.full_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Category</p>
                            <p className="font-medium text-white">{scanResult.registration?.category}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(scanResult.status === "invalid" || scanResult.status === "unpaid" || scanResult.status === "cancelled") && (
                    <div className="w-full space-y-5 text-center">
                      <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="h-12 w-12 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Invalid Pass</h2>
                        <p className="text-slate-400 bg-slate-800 p-4 rounded-xl border border-red-500/30 text-sm leading-relaxed">{scanResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-auto">
                  <button 
                    onClick={resetScanner} 
                    className="w-full h-14 bg-primary rounded-2xl font-bold text-white shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98] tracking-wide text-lg"
                  >
                    Scan Next Player
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
