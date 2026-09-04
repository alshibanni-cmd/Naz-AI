"use client";

import { createContext, useContext, ReactNode } from 'react';

const LanguageContext = createContext<{ t: (key: string) => string }>({ t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string) => key;
  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}