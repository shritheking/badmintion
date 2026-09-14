"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

export default function QRCodeDisplay({ token, name, category, registrationId }: { token: string, name: string, category: string, registrationId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, token, {
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
  }, [token]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Pass-${registrationId}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-2 rounded-xl shadow-inner border inline-block mb-2">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest text-center uppercase">
        Show at Venue
      </p>
      <button 
        onClick={handleDownload}
        className="w-full inline-flex items-center justify-center h-10 rounded-md bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors uppercase tracking-wide text-xs"
      >
        <Download className="mr-2 h-3 w-3" />
        Download Pass
      </button>
    </div>
  );
}
