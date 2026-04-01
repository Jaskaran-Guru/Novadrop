"use client";

import { useEffect } from "react";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export function getUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};
  const stored = sessionStorage.getItem("utm_params");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

export function captureUTMParams() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(
    (key) => {
      const value = params.get(key);
      if (value) utm[key as keyof UTMParams] = value;
    }
  );

  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem("utm_params", JSON.stringify(utm));
  }
}

export function useUTMCapture() {
  useEffect(() => {
    captureUTMParams();
  }, []);
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

export async function trackEvent(
  eventType: string,
  data: {
    productId?: string;
    orderId?: string;
    page?: string;
    value?: number;
    abVariant?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const utm = getUTMParams();
  const sessionId = getSessionId();

  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        sessionId,
        ...utm,
        ...data,
      }),
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}
