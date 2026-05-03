"use client";

import React from "react";
import { FileText, Loader2 } from "lucide-react";
import { Bill } from "./Bill";
import { createPortal } from "react-dom";

interface DownloadBillButtonProps {
  order: any;
}

export default function DownloadBillButton({ order }: DownloadBillButtonProps) {
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handleDownload = () => {
    setIsPrinting(true);
    
    // Create a temporary hidden container for the bill
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the bill.");
      setIsPrinting(false);
      return;
    }

    const billHtml = `
      <html>
        <head>
          <title>Bill_${order.id.slice(-8)}</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
            }
          </style>
        </head>
        <body>
          <div id="bill-content"></div>
        </body>
      </html>
    `;

    printWindow.document.write(billHtml);
    
    // We need to wait for Tailwind to load and React to render
    // For simplicity in this demo, we'll just use a pre-rendered HTML string or similar
    // But since we want it to look exactly like the component, let's just trigger a print on the current page with a hidden element
    
    setIsPrinting(false);
    window.print();
  };

  return (
    <>
      <button
        onClick={() => window.print()}
        className="glass text-purple-400 hover:text-white py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-purple-500/20 hover:bg-purple-500/10"
      >
        <FileText className="w-4 h-4" />
        Download Bill PDF
      </button>

      {/* Hidden Bill for Printing */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        <Bill order={order} />
      </div>
    </>
  );
}
