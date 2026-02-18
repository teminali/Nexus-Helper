"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import type { Language } from "@/app/i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage, languages, t } = useLanguage();

  const currentLang = languages.find((l) => l.code === language);
  const selectLabel = t("language.select") as string;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9 rounded-full glass hover:bg-white/10"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">{selectLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-slate-700/50 w-48">
        <div className="px-2 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
          {selectLabel}
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className="flex items-center gap-2 cursor-pointer text-slate-300 focus:text-white focus:bg-white/10"
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <Check className="h-4 w-4 ml-auto text-cyan-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
