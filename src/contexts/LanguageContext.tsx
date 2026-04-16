import React, { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "th";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, th: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (en) => en,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = () => setLang((l) => (l === "en" ? "th" : "en"));
  const t = (en: string, th: string) => (lang === "en" ? en : th);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
