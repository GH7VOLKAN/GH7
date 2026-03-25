"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface PanelBrand {
  id: string;
  name: string;
  domain: string;
  sector: string | null;
  type: string;
  serviceRegions: string[];
}

export interface PanelProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  plan: string;
  emailWeeklyReport: boolean;
}

export interface PanelContextValue {
  brand: PanelBrand | null;
  profile: PanelProfile | null;
  plan: string;
  isDemo: boolean;
}

const PanelContext = createContext<PanelContextValue>({
  brand: null,
  profile: null,
  plan: "free",
  isDemo: true,
});

export function PanelDataProvider({
  children,
  brand,
  profile,
  plan,
  isDemo,
}: PanelContextValue & { children: ReactNode }) {
  return (
    <PanelContext.Provider value={{ brand, profile, plan, isDemo }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanelContext() {
  return useContext(PanelContext);
}
