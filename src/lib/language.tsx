"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import pt from "@/i18n/pt.json";

type Locale = "en" | "es" | "pt";

const translations: Record<Locale, typeof en> = { en, es, pt };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export type { Locale };
