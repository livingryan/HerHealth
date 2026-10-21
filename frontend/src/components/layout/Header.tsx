import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, Droplets, BookMarked, Home, LayoutDashboard } from "lucide-react";
import { Logo } from "../Logo";
import { Link } from "../ui/Link";
import { useTranslation } from "react-i18next";
import i18n from "../../lib/i18n";
import { setLanguage } from "../../lib/i18n";

interface NavItem {
  href: string;
  labelKey: string;
  icon?: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/cycle-tracking", labelKey: "nav.cycle_tracking", icon: Droplets },
  { href: "/education", labelKey: "nav.education", icon: BookOpen },
  { href: "/journal", labelKey: "nav.journal", icon: BookMarked },
];

interface Language {
  code: string;
  label: string;
  native: string;
}

const DEFAULT_LANGUAGE: Language = { code: "en", label: "English", native: "English" };
const LANGUAGES: Language[] = [
  DEFAULT_LANGUAGE,
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

function itemActive(href: string, location: { pathname: string }) {
  return href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);
}

export const Header = () => {
  const location = useLocation();
  const { t, i18n: i18nHook } = useTranslation();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLangChange = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setLangOpen(false);
    setOpen(false);
  };

  const currentLang: Language = LANGUAGES.find((l) => l.code === i18nHook.language?.split("-")[0]) ?? DEFAULT_LANGUAGE;

  return (
    <header className="sticky top-0 z-40 bg-blush/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="page-container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-deep font-serif text-section shrink-0" aria-label="HerHealth AI home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = itemActive(item.href, location);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => {
                  const a = isActive || active;
                  return [
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    a
                      ? "bg-deep text-white font-medium"
                      : "text-ink/70 hover:bg-rose hover:text-deep",
                  ]
                    .filter(Boolean)
                    .join(" ");
                }}
                end={item.href === "/"}
              >
                {Icon && <Icon size={15} strokeWidth={2} className="shrink-0" />}
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language selector — desktop */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-ink/60 hover:bg-rose hover:text-deep transition-colors"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Select language"
            >
              <span>{currentLang.native}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            {langOpen && (
              <div
                className="absolute right-0 mt-1 w-36 rounded-lg border border-border bg-white shadow-softLG z-50 py-1"
                role="listbox"
                aria-label="Language options"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={currentLang.code === lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={[
                      "w-full text-left px-3 py-2 text-sm hover:bg-rose transition-colors",
                      currentLang.code === lang.code ? "text-deep font-medium" : "text-ink/70",
                    ].join(" ")}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-ink hover:bg-rose"
            onClick={() => { setOpen((o) => !o); setLangOpen(false); }}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          >
            {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Backdrop for lang dropdown */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-white shadow-soft">
          <nav aria-label="Mobile navigation" className="page-container py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = itemActive(item.href, location);
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => {
                    const a = isActive || active;
                    return [
                      "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors",
                      a ? "bg-deep text-white font-medium" : "text-ink/70 hover:bg-rose hover:text-deep",
                    ]
                      .filter(Boolean)
                      .join(" ");
                  }}
                  end={item.href === "/"}
                >
                  {Icon && <Icon size={18} strokeWidth={2} className="shrink-0" />}
                  {t(item.labelKey)}
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile language selector */}
          <div className="px-4 pb-4 border-t border-border pt-4">
            <p className="text-xs text-ink/50 uppercase tracking-wider mb-2">{t("nav.language", "Language")}</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                    currentLang.code === lang.code
                      ? "bg-deep text-white border-deep"
                      : "border-border text-ink/60 hover:bg-rose hover:text-deep",
                  ].join(" ")}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
