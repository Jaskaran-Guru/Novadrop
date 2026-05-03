"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, MapPin, Calendar, Hash } from "lucide-react";

interface BillProps {
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    subtotal: number;
    createdAt: string | Date;
    items: Array<{
      product: { name: string };
      quantity: number;
      price: number;
    }>;
    shippingAddress?: any;
  };
}

export const Bill: React.FC<BillProps> = ({ order }) => {
  return (
    <div id="printable-bill" className="bg-white text-slate-950 p-12 max-w-2xl mx-auto rounded-3xl shadow-2xl border border-slate-100 print:shadow-none print:border-0 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Novadrop</h2>
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Premium E-Commerce Store</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-slate-400 mb-1">
            <Hash className="w-3 h-3" />
            <span className="text-[10px] uppercase font-black tracking-widest">Invoice Number</span>
          </div>
          <p className="font-mono text-xl font-bold text-purple-600">{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12 border-y border-slate-100 py-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Billed To</p>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            <p className="text-xs text-slate-500">{order.customerEmail}</p>
          </div>
          {order.shippingAddress && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3 h-3" />
                <p className="text-[10px] uppercase font-black tracking-widest">Shipping Address</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {order.shippingAddress.line1},<br />
                {order.shippingAddress.city}, {order.shippingAddress.postal_code}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4 text-right">
          <div className="space-y-1">
            <div className="flex items-center justify-end gap-1.5 text-slate-400">
              <Calendar className="w-3 h-3" />
              <p className="text-[10px] uppercase font-black tracking-widest">Order Date</p>
            </div>
            <p className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Payment Status</p>
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Paid</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <div className="grid grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <p className="col-span-2 text-[10px] uppercase font-black text-slate-400 tracking-widest">Description</p>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest text-center">Qty</p>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Amount</p>
        </div>
        {order.items.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 last:border-0">
            <p className="col-span-2 font-bold text-slate-900 text-sm">{item.product.name}</p>
            <p className="text-sm text-slate-500 text-center font-mono">{item.quantity}</p>
            <p className="text-sm font-bold text-slate-900 text-right font-mono">{formatPrice(item.price)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-slate-50 rounded-2xl p-8 space-y-3">
        <div className="flex justify-between items-center text-slate-500">
          <p className="text-xs font-bold uppercase tracking-widest">Subtotal</p>
          <p className="font-mono font-bold">{formatPrice(order.subtotal)}</p>
        </div>
        <div className="flex justify-between items-center text-slate-500">
          <p className="text-xs font-bold uppercase tracking-widest">Tax (0%)</p>
          <p className="font-mono font-bold">{formatPrice(0)}</p>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-sm font-black uppercase tracking-widest text-slate-900">Total Amount</p>
          <p className="text-2xl font-black text-purple-600 font-mono">{formatPrice(order.total)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Thank you for choosing Novadrop</p>
        <div className="h-1 w-12 bg-purple-200 mx-auto rounded-full"></div>
      </div>
    </div>
  );
};
