"use client";

import { useState } from "react";
import { Card, CardContent, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/components/ui";
import { Globe, CheckCircle, ChevronRight } from "lucide-react";

type AIProductLanguage = "EN" | "FR" | "AR" | "ES" | "DE" | "ZH" | "JA";

interface LanguageConfig {
  code: AIProductLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

const LANGUAGES: LanguageConfig[] = [
  { code: "EN", name: "English", nativeName: "English", flag: "🇬🇧", rtl: false },
  { code: "FR", name: "French", nativeName: "Français", flag: "🇫🇷", rtl: false },
  { code: "AR", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", rtl: true },
  { code: "ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸", rtl: false },
  { code: "DE", name: "German", nativeName: "Deutsch", flag: "🇩🇪", rtl: false },
  { code: "ZH", name: "Chinese", nativeName: "中文", flag: "🇨🇳", rtl: false },
  { code: "JA", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", rtl: false },
];

interface AILanguageSelectorProps {
  selectedLanguage?: AIProductLanguage;
  onLanguageChange: (language: AIProductLanguage) => void;
  disabled?: boolean;
  enableMultiLanguage?: boolean;
}

export function AILanguageSelector({ 
  selectedLanguage = "EN", 
  onLanguageChange, 
  disabled = false,
  enableMultiLanguage = false 
}: AILanguageSelectorProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<AIProductLanguage[]>([selectedLanguage]);

  const selectedConfig = LANGUAGES.find(l => l.code === selectedLanguage);

  const toggleLanguage = (code: AIProductLanguage) => {
    if (enableMultiLanguage) {
      setSelectedLanguages(prev => 
        prev.includes(code) 
          ? prev.filter(l => l !== code)
          : [...prev, code]
      );
    } else {
      onLanguageChange(code);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Generation Language</Label>
        <Select 
          value={selectedLanguage} 
          onValueChange={onLanguageChange} 
          disabled={disabled}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                  <span className="text-muted-foreground text-sm">({lang.nativeName})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedConfig && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedConfig.flag}</span>
                <div>
                  <h4 className="font-semibold text-lg">{selectedConfig.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedConfig.nativeName}</p>
                </div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            {selectedConfig.rtl && (
              <Badge variant="outline" className="mt-3">
                RTL Support
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {enableMultiLanguage && (
        <div>
          <Label className="mb-3 block">Generate in Multiple Languages</Label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => !disabled && toggleLanguage(lang.code)}
                  disabled={disabled}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                    isSelected 
                      ? "border-brand-600 bg-brand-50" 
                      : "border-border hover:border-brand-300"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </div>
                  {isSelected && <ChevronRight className="h-4 w-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
        <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Auto-Translation</p>
          <p>Products will be automatically translated to all selected languages with culturally appropriate content.</p>
        </div>
      </div>
    </div>
  );
}
