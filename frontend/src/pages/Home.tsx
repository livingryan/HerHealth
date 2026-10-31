import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../components/ui/Link";
import { Droplets, BookOpen, BookMarked, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section bg-gradient-to-b from-blush to-white" aria-labelledby="hero-heading">
        <div className="page-container">
          <div className="md:flex md:items-center md:gap-12 lg:gap-20">
            <div className="md:w-1/2 max-w-xl">
              <p className="text-xs font-sans font-semibold text-pink tracking-wider uppercase mb-4">
                Your health, understood
              </p>
              <h1 id="hero-heading" className="text-display-lg font-serif text-ink mb-6 leading-tight">
                {t("home.hero.heading")}
              </h1>
              <p className="text-body-lg text-ink/70 mb-8 leading-relaxed">
                {t("home.hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-deep text-white text-sm font-medium rounded-lg hover:bg-pink transition-colors"
                >
                  <Droplets size={16} />
                  Explore your health
                </Link>
                <Link
                  to="/cycle-tracking"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-deep text-sm font-medium rounded-lg border border-border hover:bg-rose transition-colors"
                >
                  {t("home.hero.explore")}
                </Link>
                <Link
                  to="/education"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-deep text-sm font-medium rounded-lg border border-border hover:bg-rose transition-colors"
                >
                  <BookOpen size={16} />
                  {t("home.hero.learn")}
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-label="Features">
        <div className="page-container">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Droplets size={24} className="text-deep" />}
              eyebrow={t("home.features.tracking.eyebrow")}
              title={t("home.features.tracking.title")}
              description={t("home.features.tracking.description")}
              cta={t("home.features.tracking.cta")}
              href="/cycle-tracking"
            />
            <FeatureCard
              icon={<BookOpen size={24} className="text-deep" />}
              eyebrow={t("home.features.education.eyebrow")}
              title={t("home.features.education.title")}
              description={t("home.features.education.description")}
              cta={t("home.features.education.cta")}
              href="/education"
            />
            <FeatureCard
              icon={<BookMarked size={24} className="text-deep" />}
              eyebrow={t("home.features.journal.eyebrow")}
              title={t("home.features.journal.title")}
              description={t("home.features.journal.description")}
              cta={t("home.features.journal.cta")}
              href="/journal"
            />
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="section bg-cream" aria-labelledby="privacy-heading">
        <div className="page-container">
          <div className="max-w-xl mx-auto text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-border shadow-soft mb-4">
              <ShieldCheck size={22} className="text-deep" />
            </div>
            <h2 id="privacy-heading" className="text-display-md font-serif text-ink mb-4">
              {t("home.privacy.heading")}
            </h2>
            <p className="text-ink/70 leading-relaxed">{t("home.privacy.text")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <PrivacyCard
              title={t("home.privacy.items.local.title")}
              body={t("home.privacy.items.local.body")}
            />
            <PrivacyCard
              title={t("home.privacy.items.nocollect.title")}
              body={t("home.privacy.items.nocollect.body")}
            />
            <PrivacyCard
              title={t("home.privacy.items.control.title")}
              body={t("home.privacy.items.control.body")}
            />
          </div>
        </div>
      </section>

      {/* Anemia screening teaser */}
      <section className="section bg-white" aria-labelledby="screening-heading">
        <div className="page-container">
          <div className="md:flex md:items-center md:gap-12">
            <div className="md:w-1/2">
              <p className="text-xs font-sans font-semibold text-pink tracking-wider uppercase mb-3">
                {t("home.features.screening.eyebrow")}
              </p>
              <h2 id="screening-heading" className="text-display-md font-serif text-ink mb-6">
                {t("home.features.screening.title")}
              </h2>
              <p className="text-ink/70 mb-6 leading-relaxed">
                {t("home.features.screening.description")}
              </p>
              <div className="rounded-xl border border-deep/20 bg-cream p-5">
                <p className="font-semibold text-deep mb-2">{t("home.features.screening.honest_title")}</p>
                <p className="text-sm text-deep/80 leading-relaxed">{t("home.features.screening.honest_text")}</p>
              </div>
              <Link
                to="/screening/anemia"
                className="inline-block mt-6 text-sm font-medium text-deep hover:underline"
              >
                Explore screening prototype →
              </Link>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <ScreeningIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Education preview */}
      <section className="section bg-blush" aria-labelledby="education-preview-heading">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 id="education-preview-heading" className="text-display-md font-serif text-ink">
              Featured Health Articles
            </h2>
            <Link to="/education" className="text-sm font-medium text-deep hover:underline">
              {t("home.education_browse")} →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Understanding anemia and iron deficiency", category: "Anemia", time: "5 min read", href: "/education" },
              { title: "Menstrual health: what is typical and what is not", category: "Menstrual health", time: "5 min read", href: "/education" },
              { title: "When to seek medical attention", category: "Care guidance", time: "4 min read", href: "/education" },
            ].map((card) => (
              <Link key={card.title} to={card.href} className="group block bg-white rounded-xl border border-border p-5 hover:shadow-soft transition-shadow">
                <span className="text-xs text-deep font-medium">{card.category} · {card.time}</span>
                <p className="mt-2 font-serif text-ink group-hover:text-deep transition-colors leading-snug">{card.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  eyebrow,
  title,
  description,
  cta,
  href,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="w-10 h-10 rounded-xl bg-rose flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-2">{eyebrow}</p>
      <h3 className="font-serif text-section font-semibold text-ink mb-3">{title}</h3>
      <p className="text-sm text-ink/70 leading-relaxed flex-grow mb-4">{description}</p>
      <Link to={href} className="text-sm font-medium text-deep hover:underline inline-flex items-center gap-1">
        {cta}
      </Link>
    </div>
  );
}

function PrivacyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="w-8 h-8 rounded-lg bg-sage/30 flex items-center justify-center mb-3">
        <Heart size={14} className="text-deep" />
      </div>
      <p className="font-semibold text-ink text-sm mb-2">{title}</p>
      <p className="text-xs text-ink/60 leading-relaxed">{body}</p>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative h-80 md:h-96 w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 380" className="w-full h-full" aria-hidden="true">
        {/* Background blobs */}
        <circle cx="280" cy="80" r="100" fill="#F8DCE6" opacity="0.7" />
        <circle cx="350" cy="280" r="120" fill="#FCEBF1" opacity="0.5" />
        <circle cx="80" cy="300" r="80" fill="#FFF8FA" stroke="#F0DDE3" strokeWidth="2" />

        {/* Calendar card */}
        <rect x="60" y="60" width="180" height="200" rx="16" fill="white" stroke="#F0DDE3" strokeWidth="1.5" />
        <rect x="60" y="60" width="180" height="40" rx="16" fill="#8D435F" />
        <rect x="60" y="84" width="180" height="16" fill="#8D435F" />
        <text x="150" y="87" textAnchor="middle" fill="white" fontSize="13" fontFamily="Georgia, serif">October</text>
        {/* Calendar grid dots */}
        {[0,1,2,3,4,5,6].map(c => (
          <text key={c} x={80 + c * 23} y="120" textAnchor="middle" fill="#F0DDE3" fontSize="9">{["S","M","T","W","T","F","S"][c]}</text>
        ))}
        {[1,2,3,4,5,6,7].map((d, i) => (
          <circle key={d} cx={80 + (i % 7) * 23} cy={142} r="8" fill={d === 3 ? "#8D435F" : "transparent"} />
        ))}
        {[8,9,10,11,12,13,14].map((d, i) => (
          <circle key={d} cx={80 + (i % 7) * 23} cy={166} r="8" fill={[8,9,10].includes(d) ? "#F8DCE6" : "transparent"} />
        ))}
        {[15,16,17,18,19,20,21].map((d, i) => (
          <circle key={d} cx={80 + (i % 7) * 23} cy={190} r="8" fill={d === 21 ? "#B8CDB8" : "transparent"} />
        ))}
        {[1,2,3,4,5,6,7].map((d, i) => <text key={`t${d}`} x={80 + (i % 7) * 23} y={145} textAnchor="middle" fill={d === 3 ? "white" : "#382C32"} fontSize="9" opacity="0.7">{d}</text>)}
        {[8,9,10,11,12,13,14].map((d, i) => <text key={`t${d}`} x={80 + (i % 7) * 23} y={169} textAnchor="middle" fill={[8,9,10].includes(d) ? "#8D435F" : "#382C32"} fontSize="9" opacity="0.7">{d}</text>)}
        {[15,16,17,18,19,20,21].map((d, i) => <text key={`t${d}`} x={80 + (i % 7) * 23} y={193} textAnchor="middle" fill={d === 21 ? "#4a6b4a" : "#382C32"} fontSize="9" opacity="0.7">{d}</text>)}

        {/* Floating pill badge */}
        <rect x="200" y="210" width="130" height="36" rx="18" fill="white" stroke="#F0DDE3" strokeWidth="1.5" />
        <circle cx="219" cy="228" r="10" fill="#E9A1BA" />
        <text x="237" y="232" fill="#382C32" fontSize="10">Cycle day 14</text>

        {/* Mood badge */}
        <rect x="170" y="280" width="80" height="30" rx="15" fill="#FFF8FA" stroke="#F0DDE3" strokeWidth="1.5" />
        <text x="210" y="300" textAnchor="middle" fill="#8D435F" fontSize="11">😊 Great</text>
      </svg>
    </div>
  );
}

function ScreeningIllustration() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-3">
          Example · Inner lower eyelid
        </p>
        <svg viewBox="0 0 320 160" className="w-full h-auto" role="img" aria-label="Illustration of inner lower eyelid">
          <rect width="320" height="160" fill="#FFF8FA" rx="12" />
          <path d="M40 80 Q 160 20 280 80 Q 160 140 40 80 Z" fill="#F8DCE6" />
          <path d="M40 80 Q 160 20 280 80" fill="none" stroke="#8D435F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 88 Q 160 128 260 88" fill="none" stroke="#E9A1BA" strokeWidth="8" strokeLinecap="round" opacity="0.75" />
          <ellipse cx="160" cy="76" rx="30" ry="22" fill="#FFFFFF" />
          <circle cx="160" cy="76" r="13" fill="#8D435F" />
          <circle cx="160" cy="76" r="5" fill="#382C32" />
          <circle cx="154" cy="70" r="3.5" fill="#FFFFFF" opacity="0.9" />
        </svg>
        <p className="text-xs text-ink/50 mt-3">Well-lit and unfiltered. Skin tone and lighting affect how pale an eyelid appears.</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-3">
          Example · Fingernail and nail bed
        </p>
        <svg viewBox="0 0 320 160" className="w-full h-auto" role="img" aria-label="Illustration of fingernail and nail bed">
          <rect width="320" height="160" fill="#FFF8FA" rx="12" />
          <path d="M120 160 Q 118 80 160 64 Q 202 80 200 160 Z" fill="#F1C4A8" />
          <path d="M132 160 Q 130 90 160 74 Q 190 90 188 160 Z" fill="#F8D3BE" />
          <path d="M138 116 Q 160 106 182 116 L 182 134 Q 160 144 138 134 Z" fill="#E7A98F" opacity="0.85" />
          <path d="M136 110 Q 160 98 184 110 L 186 122 Q 160 134 134 122 Z" fill="#FBE3D6" stroke="#D9A488" strokeWidth="2" />
        </svg>
        <p className="text-xs text-ink/50 mt-3">Natural nails only, daylight, no filters.</p>
      </div>
    </div>
  );
}
