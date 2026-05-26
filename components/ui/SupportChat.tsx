"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Minimize2,
  ChevronRight,
} from "lucide-react";

const FAQ: Record<string, string> = {
  track:    "To track your order, go to **Account → Orders** and click any order to see the live status timeline.",
  return:   "We offer **hassle-free returns within 30 days** of delivery. Go to Account → Orders → select order → Request Return.",
  refund:   "Refunds are processed within **5–7 business days** to your original payment method once we receive the item.",
  cancel:   "Orders can be cancelled **within 2 hours** of placing them. After that, please initiate a return after delivery.",
  shipping: "We offer **free shipping on orders above ₹999**. Standard delivery: 3–7 business days. Express available at checkout.",
  payment:  "We accept **UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery** (COD available for orders under ₹5,000).",
  discount: "Sign up for our newsletter and get **₹200 off** your first order! We also run seasonal sales.",
  size:     "Size guides are available on every product page. If between sizes, we recommend **sizing up**.",
  contact:  "Reach our support team at **support@novadrop.in** or call **1800-XXX-XXXX** (Mon–Sat, 9AM–6PM IST).",
  warranty: "Electronics come with **1-year manufacturer warranty**. Fashion & accessories have a **6-month quality guarantee**.",
  exchange: "We offer **free exchanges within 30 days**. Go to Account → Orders → select order → Request Exchange.",
};

const QUICK_QS = [
  "How do I track my order?",
  "What's your return policy?",
  "When will I get my refund?",
  "What payment methods do you accept?",
  "How long does shipping take?",
];

type Message = { role: "user" | "bot"; text: string; time: string };

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function findAnswer(input: string): string {
  const q = input.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ)) {
    if (q.includes(key)) return answer;
  }
  if ((q.includes("where") || q.includes("status")) && q.includes("order")) return FAQ.track;
  if (q.includes("money") || q.includes("paid") || q.includes("charge")) return FAQ.refund;
  if (q.includes("deliver") || q.includes("fast") || q.includes("days")) return FAQ.shipping;
  if (q.includes("broken") || q.includes("damage") || q.includes("wrong")) return FAQ.return;
  if (q.includes("coupon") || q.includes("code") || q.includes("offer")) return FAQ.discount;
  return "I couldn't find a specific answer for that. Please contact our team at **support@novadrop.in** and we'll get back to you within 2 business hours! 🙏";
}

function BotText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-purple-300 font-semibold">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function SupportChat() {
  const [open, setOpen]           = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [typing, setTyping]       = useState(false);
  const [input, setInput]         = useState("");
  const [unread, setUnread]       = useState(0);
  const [messages, setMessages]   = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Hi! I'm **Nova**, your NovaDrop AI assistant. How can I help you today?",
      time: getTime(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, open, minimized]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { role: "user", text: trimmed, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
    const answer = findAnswer(trimmed);
    setMessages((prev) => [...prev, { role: "bot", text: answer, time: getTime() }]);
    setTyping(false);

    if (!open) setUnread((n) => n + 1);
  };

  return (
    <>
      {/* FAB */}
      <button
        id="support-chat-toggle"
        aria-label="Open support chat"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 shadow-xl shadow-purple-900/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 group"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
      </button>

      {/* Window */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-80 sm:w-[360px] rounded-2xl border border-white/10 shadow-2xl shadow-black/70 flex flex-col overflow-hidden transition-all duration-300 ${
            minimized ? "h-14" : "h-[520px]"
          }`}
          style={{ background: "rgba(10,10,18,0.97)", backdropFilter: "blur(24px)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0 bg-gradient-to-r from-purple-900/50 to-violet-900/30">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Nova Support</p>
              <p className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                Online · Replies instantly
              </p>
            </div>
            <button
              onClick={() => setMinimized((m) => !m)}
              className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-0.5 max-w-[78%] ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-purple-600 text-white rounded-tr-sm"
                            : "bg-white/5 text-gray-200 rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "bot" ? <BotText text={msg.text} /> : msg.text}
                      </div>
                      <span className="text-[9px] text-gray-600 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Questions — only show early in conversation */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_QS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex items-center gap-1 text-[10px] bg-purple-900/30 border border-purple-800/40 text-purple-300 px-2.5 py-1.5 rounded-full hover:bg-purple-800/40 transition-all"
                    >
                      <ChevronRight className="w-2.5 h-2.5" />
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-white/5 flex-shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/8 px-3 py-2"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    disabled={typing}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || typing}
                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
                <p className="text-[9px] text-gray-700 text-center mt-1.5">
                  Powered by NovaDrop AI · support@novadrop.in
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
