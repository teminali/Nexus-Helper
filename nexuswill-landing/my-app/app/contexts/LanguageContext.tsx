"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations, type Language, languages } from "@/app/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | Record<string, string>;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested translation value
function getNestedValue(obj: Record<string, unknown>, path: string): string | Record<string, string> | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  if (typeof current === "string") {
    return current;
  }
  if (typeof current === "object" && current !== null) {
    return current as Record<string, string>;
  }
  return undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage or detect from browser
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && languages.some((l) => l.code === savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as Language;
      if (languages.some((l) => l.code === browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }, []);

  // Translation function
  const t = useCallback(
    (key: string): string | Record<string, string> => {
      const currentTranslations = translations[language];
      const value = getNestedValue(currentTranslations as Record<string, unknown>, key);
      
      if (value !== undefined) {
        return value;
      }
      
      // Fallback to English
      const fallbackValue = getNestedValue(translations.en as Record<string, unknown>, key);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
      // Return key if not found
      return key;
    },
    [language]
  );

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook for typed translations with interpolation
export function useTranslation() {
  const { t, language } = useLanguage();
  
  const translate = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = t(key);
      
      if (typeof value !== "string") {
        return key;
      }
      
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = (value as string).replace(
            new RegExp(`{${paramKey}}`, "g"),
            String(paramValue)
          );
        });
      }
      
      return value as string;
    },
    [t]
  );
  
  return { t: translate, language };
}
