"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { getSessionId, trackEvent } from "@/lib/utm";

type Variant = "A" | "B";

interface ABTestContextType {
  variant: Variant;
}

const ABTestContext = createContext<ABTestContextType>({ variant: "A" });

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>("A");

  useEffect(() => {
    // Assign variant based on session ID (deterministic for same user)
    const sessionId = getSessionId();
    const charCodeSum = sessionId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const assignedVariant: Variant = charCodeSum % 2 === 0 ? "A" : "B";
    
    setVariant(assignedVariant);
    
    // Cookie to persist across page reloads (nextjs middleware could also handle this)
    document.cookie = `ab_variant=${assignedVariant}; path=/; max-age=31536000`;
    
    // Track impression
    trackEvent("ab_test_impression", {
      abVariant: assignedVariant,
      metadata: { page: window.location.pathname }
    });
  }, []);

  return (
    <ABTestContext.Provider value={{ variant }}>
      {children}
    </ABTestContext.Provider>
  );
}

export function useABVariant() {
  return useContext(ABTestContext);
}

export function ABTest({
  variantA,
  variantB,
}: {
  variantA: React.ReactNode;
  variantB: React.ReactNode;
}) {
  const { variant } = useABVariant();
  return <>{variant === "A" ? variantA : variantB}</>;
}
