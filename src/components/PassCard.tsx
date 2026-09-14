"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, CalendarDays, MapPin, CheckCircle2, Loader2 } from "lucide-react";

export default function PassCard({ registration }: { registration: any }) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, registration.qr_token, {
        width: 140,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [registration.qr_token]);

  const handleDownload = async () => {
    if (!passRef.current) return;
    setDownloading(true);
    try {
      // Dynamically load html2canvas from CDN
      let html2canvas: any = (window as any).html2canvas;
      if (!html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = () => {
            html2canvas = (window as any).html2canvas;
            resolve(html2canvas);
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Hide the download button during capture using a class
      const downloadBtn = document.getElementById("download-btn-container");
      if (downloadBtn) downloadBtn.style.visibility = "hidden";

      const canvas = await html2canvas(passRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      if (downloadBtn) downloadBtn.style.visibility = "visible";

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `SMASHPRO-Pass-${registration.registration_id}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Failed to download pass", err);
      alert("Failed to download pass. Please try taking a screenshot instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div 
        ref={passRef} 
        className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative mb-4 shrink-0"
        style={{ borderRadius: "16px" }}
      >
        
        {/* Ticket Header */}
        <div className="bg-white p-4 text-center rounded-t-2xl relative border-b border-slate-100">
          <img src="/logo.png" alt="SMASHPRO" className="h-10 mx-auto" crossOrigin="anonymous" />
        </div>
        
        {/* Pass Info */}
        <div className="p-4 pb-2 text-center bg-white">
          <h2 className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">DIGITAL ENTRY PASS</h2>
          <div className="my-2 space-y-0.5">
            <h3 className="text-xl font-black text-slate-900 leading-tight">{registration.full_name}</h3>
            <p className="text-sm font-semibold text-primary">{registration.category}</p>
          </div>
          
          <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "12px", marginTop: "4px" }}>
            <div style={{ marginBottom: "4px" }}>
              <CalendarDays style={{ display: "inline-block", verticalAlign: "middle", width: "12px", height: "12px", marginRight: "4px" }} />
              <span style={{ display: "inline-block", verticalAlign: "middle" }}>Sunday, September 20th</span>
            </div>
            <div>
              <MapPin style={{ display: "inline-block", verticalAlign: "middle", width: "12px", height: "12px", marginRight: "4px" }} />
              <span style={{ display: "inline-block", verticalAlign: "middle" }}>Learn Fort Badminton Court, Bangalapatti, Vattalagundu</span>
            </div>
          </div>
          
          <div className="inline-block bg-slate-100 rounded-md px-3 py-1 font-mono text-xs font-bold text-slate-600 mb-3 border border-slate-200">
            {registration.registration_id}
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-white p-2 rounded-xl shadow-inner border inline-block mb-2">
              <canvas ref={qrCanvasRef} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest text-center uppercase">
              Show at Venue
            </p>
          </div>
        </div>
        
        {/* Status Area */}
        <div className="bg-slate-50 border-t border-dashed border-slate-300 p-4">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
              <span style={{ fontWeight: "600", color: "#64748b" }}>Payment</span>
              <div style={{ textAlign: "right", color: "#16a34a", fontWeight: "bold" }}>
                <CheckCircle2 style={{ display: "inline-block", verticalAlign: "middle", width: "12px", height: "12px", marginRight: "4px" }} />
                <span style={{ display: "inline-block", verticalAlign: "middle" }}>VERIFIED</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
              <span style={{ fontWeight: "600", color: "#64748b" }}>Registration</span>
              <div style={{ textAlign: "right", color: "#16a34a", fontWeight: "bold" }}>
                <CheckCircle2 style={{ display: "inline-block", verticalAlign: "middle", width: "12px", height: "12px", marginRight: "4px" }} />
                <span style={{ display: "inline-block", verticalAlign: "middle" }}>CONFIRMED</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div id="download-btn-container" className="w-full">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors uppercase tracking-wide text-sm shadow-lg mb-4"
        >
          {downloading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Pass...</>
          ) : (
            <><Download className="mr-2 h-4 w-4" /> Download Full Pass</>
          )}
        </button>
      </div>
    </div>
  );
}
