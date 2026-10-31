/// <reference types="vite/client" />

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";
import kn from "../locales/kn.json";

const savedLang =
  typeof window !== "undefined" ? localStorage.getItem("herhealth-lang") : null;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      kn: { translation: kn },
    },
    lng: savedLang || "en",
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "mr", "kn"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

export const setLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    localStorage.setItem("herhealth-lang", lang);
  }
};

