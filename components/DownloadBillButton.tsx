"use client";

import React from "react";
import { FileText, Loader2 } from "lucide-react";
import { Bill } from "./Bill";
import { createPortal } from "react-dom";

interface DownloadBillButtonProps {
  order: any;
}

export default function DownloadBillButton({ order }: DownloadBillButtonProps) {
  const handleDownload = () => {
    const billId = `bill-${order.id.replace(/\s+/g, '-')}`;
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #${billId}, #${billId} * { visibility: visible !important; }
        #${billId} { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 100% !important; 
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <>
      <button
        onClick={handleDownload}
        className="glass text-purple-400 hover:text-white py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-purple-500/20 hover:bg-purple-500/10 px-4 min-w-[140px]"
      >
        <FileText className="w-4 h-4" />
        Print Bill
      </button>

      
      <div id={`bill-${order.id.replace(/\s+/g, '-')}`} className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <Bill order={order} />
      </div>
    </>
  );
}
