"use client";

import React from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/dictionaries";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "mr", label: "मराठी (Marathi)" },
    { code: "te", label: "తెలుగు (Telugu)" }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary rounded-full relative group">
          <Globe className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-2 bg-card border border-border shadow-lg rounded-xl">
        <div className="flex flex-col gap-1" data-no-translate="true">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                language === lang.code
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
