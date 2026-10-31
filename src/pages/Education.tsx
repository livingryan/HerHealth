import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, BookOpen, Bookmark, BookmarkCheck, X, ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { api } from "../lib/api";

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  read_time_minutes: number;
}

interface ArticleDetail extends Article {
  content: string;
  references: string[];
}

// Bookmark persistence
const BOOKMARK_KEY = "herhealth-bookmarks";
function loadBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"); }
  catch { return []; }
}
function saveBookmarks(ids: string[]) {
  try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids)); }
  catch { /**/ }
}

// Category map: backend category string → translation key
const CATEGORY_KEYS: Record<string, string> = {
  "Anemia": "anemia",
  "Nutrition": "nutrition",
  "Menstrual health": "menstrual_health",
  "PCOS": "pcos",
  "Endometriosis": "endometriosis",
  "PMS & PMDD": "pms",
  "Vaginal health": "vaginal_health",
  "Preventive care": "preventive_care",
  "Care guidance": "care_guidance",
};

// Fallback static articles when backend is unavailable
const STATIC_ARTICLES: Article[] = [
  { id: "anemia-iron-deficiency", title: "Understanding anemia and iron deficiency", category: "Anemia", excerpt: "Anemia means your blood has fewer healthy red blood cells than usual, often because of low iron. Learn the signs and when iron matters.", read_time_minutes: 5 },
  { id: "iron-rich-foods", title: "Iron-rich foods and nutrition", category: "Nutrition", excerpt: "Which foods contain iron, how to pair them for better absorption, and simple ways to build iron-supportive meals.", read_time_minutes: 6 },
  { id: "menstrual-health", title: "Menstrual health: what is typical and what is not", category: "Menstrual health", excerpt: "Cycle length, bleeding patterns, and symptoms worth tracking — and when a pattern is a reason to talk with a clinician.", read_time_minutes: 5 },
  { id: "pcos-hormonal-health", title: "PCOS and hormonal health", category: "PCOS", excerpt: "An overview of polycystic ovary syndrome symptoms, how it is assessed, and why only a clinician can diagnose it.", read_time_minutes: 6 },
  { id: "preventive-care", title: "Preventive care: screenings and checkups", category: "Preventive care", excerpt: "Routine blood pressure, blood sugar, and reproductive-health checks that help you notice patterns early.", read_time_minutes: 4 },
  { id: "when-to-seek-care", title: "When to seek medical attention", category: "Care guidance", excerpt: "Clear signs that it is time to contact a clinician or seek urgent care, written without replacing professional judgment.", read_time_minutes: 4 },
  { id: "period-pain-cramps", title: "Period pain and cramps", category: "Menstrual health", excerpt: "Understanding dysmenorrhea, what causes it, and when pain warrants medical evaluation.", read_time_minutes: 5 },
  { id: "endometriosis-overview", title: "Endometriosis: an overview", category: "Endometriosis", excerpt: "Endometriosis affects millions of women. Learn about symptoms, diagnosis challenges, and treatment options.", read_time_minutes: 7 },
  { id: "pms-pmdd", title: "PMS and PMDD", category: "PMS & PMDD", excerpt: "Premenstrual syndrome versus premenstrual dysphoric disorder — understanding the spectrum and when to seek help.", read_time_minutes: 5 },
  { id: "menstrual-hygiene", title: "Menstrual hygiene", category: "Menstrual health", excerpt: "Safe, practical information about menstrual products, hygiene practices, and myths to dispel.", read_time_minutes: 4 },
  { id: "vaginal-health", title: "Vaginal health and common misconceptions", category: "Vaginal health", excerpt: "The vagina is self-cleaning. Learn what is normal, what isn't, and what the evidence says about common practices.", read_time_minutes: 5 },
  { id: "appointment-prep", title: "Preparing for a healthcare appointment", category: "Care guidance", excerpt: "How to describe symptoms, questions to ask, and how to make the most of limited appointment time.", read_time_minutes: 4 },
];

const STATIC_CONTENT: Record<string, string> = {
  "period-pain-cramps": `## Period pain and cramps

Period pain (dysmenorrhea) is cramping pain in the lower abdomen that occurs just before or during menstruation. It is one of the most common gynaecological complaints.

### Primary vs. secondary dysmenorrhea

**Primary dysmenorrhea** refers to cramping without an underlying disease. It is caused by prostaglandins — hormone-like substances that cause the uterus to contract. Pain typically begins 1–2 days before the period and may last 2–3 days.

**Secondary dysmenorrhea** is caused by an underlying condition such as endometriosis, fibroids, or adenomyosis. Pain may start earlier in the cycle, last longer, and worsen over time.

### What may help

- Heat (a hot water bottle or heating pad) on the lower abdomen
- Over-the-counter pain relief (NSAIDs such as ibuprofen, taken with food)
- Gentle exercise
- Adequate hydration and rest

### When to see a clinician

- Pain that prevents you from your usual activities
- Pain that is getting progressively worse over months or years
- Pain that does not respond to over-the-counter pain relief
- Pain that begins well before your period or lasts long after it ends
- Fever, unusual discharge, or other worrying symptoms alongside pain

### References

- ACOG — Dysmenorrhea: Painful Periods https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods
- NHS — Period pain https://www.nhs.uk/conditions/period-pain/
- Mayo Clinic — Menstrual cramps https://www.mayoclinic.org/diseases-conditions/menstrual-cramps/symptoms-causes/syc-20374938`,

  "endometriosis-overview": `## Endometriosis: an overview

Endometriosis is a condition in which tissue similar to the lining of the uterus (endometrium) grows outside the uterus. It affects an estimated 10% of women and people with uteruses of reproductive age.

### Symptoms

- Pelvic pain, often worse during menstruation
- Pain during or after sex
- Pain with bowel movements or urination
- Heavy menstrual bleeding or bleeding between periods
- Difficulty conceiving
- Fatigue

Symptoms vary greatly. Some people with significant endometriosis have minimal symptoms; others have severe pain with limited visible disease.

### Diagnosis

Endometriosis can only be definitively diagnosed through laparoscopy (a surgical procedure). Ultrasound and MRI can detect some forms but are not definitive for all types.

### Management

There is no cure, but options include pain management, hormonal therapies, and surgery. The right approach depends on your symptoms, desire for pregnancy, and other factors — decisions best made with a gynaecologist.

### References

- World Endometriosis Society https://www.endometriosis.ca/
- ACOG — Endometriosis https://www.acog.org/womens-health/faqs/endometriosis
- NHS — Endometriosis https://www.nhs.uk/conditions/endometriosis/`,

  "pms-pmdd": `## PMS and PMDD

**Premenstrual syndrome (PMS)** refers to physical and emotional symptoms that occur in the luteal phase (the week or two before menstruation) and resolve around the start of the period.

**Premenstrual dysphoric disorder (PMDD)** is a more severe form that significantly impairs daily life. It is recognised as a distinct condition in diagnostic manuals.

### Common PMS symptoms

- Bloating, breast tenderness
- Headaches, fatigue
- Irritability, mood changes, anxiety
- Food cravings or appetite changes
- Sleep disruption

### When PMS becomes PMDD

PMDD is characterised by markedly severe mood symptoms — severe depression, anxiety, irritability, or hopelessness — that significantly affect relationships and daily functioning. It requires clinical assessment and may respond to specific treatments.

### When to seek help

If premenstrual symptoms disrupt your work, relationships, or daily life, speak with a clinician. Effective treatments exist.

### References

- ACOG — Premenstrual Syndrome (PMS) https://www.acog.org/womens-health/faqs/premenstrual-syndrome
- NIMH — Premenstrual Dysphoric Disorder https://www.nimh.nih.gov/health/topics/premenstrual-dysphoric-disorder-pmdd
- NHS — PMS https://www.nhs.uk/conditions/premenstrual-syndrome/`,

  "menstrual-hygiene": `## Menstrual hygiene

Safe menstrual hygiene practices protect your health and comfort. There is no universally correct product — the best choice is what is safe, accessible, and comfortable for you.

### Menstrual products

- **Disposable pads and tampons**: widely available; tampons carry a small risk of toxic shock syndrome (TSS) if left in too long (change every 4–8 hours; use the lowest absorbency appropriate).
- **Reusable cloth pads**: cost-effective and environmentally friendly when washed properly.
- **Menstrual cups and discs**: reusable silicone or rubber devices; safe when cleaned correctly; can be worn for up to 12 hours.
- **Period underwear**: absorbent underwear; wash according to manufacturer instructions.

### General hygiene

- Change products regularly (every 4–8 hours for most products).
- Wash hands before and after changing.
- The vagina is self-cleaning; internal douching is not recommended and can disrupt the natural flora.

### References

- WHO — Menstrual hygiene https://www.who.int/news-room/fact-sheets/detail/menstrual-hygiene
- CDC — Menstrual Hygiene https://www.cdc.gov/hygiene/personal-hygiene/menstrual.html`,

  "vaginal-health": `## Vaginal health and common misconceptions

The vagina is a self-cleaning organ. Understanding what is and is not normal can help you identify when something may warrant medical attention.

### The vaginal microbiome

Healthy vaginal flora is dominated by Lactobacillus bacteria that maintain an acidic pH. This environment protects against infections. Disrupting this balance — through douching, scented products, or antibiotics — can increase the risk of bacterial vaginosis or yeast infections.

### What is normal

- Clear to white discharge that may vary throughout the cycle
- Mild odour that changes slightly with hormonal shifts
- Discharge that increases around ovulation (may be stretchy and clear)

### What may indicate a problem

- Unusual smell (strong, fishy, or foul)
- Change in colour (yellow, green, grey)
- Unusual amount or texture
- Itching, burning, or irritation
- Bleeding between periods or after sex

### Common misconceptions

- **"Douching keeps the vagina clean"** — False. The vagina cleans itself. Douching disrupts the natural pH and can increase infection risk.
- **"All discharge is abnormal"** — False. Discharge is a healthy, normal function.

### References

- ACOG — Vaginal Health https://www.acog.org/womens-health/faqs/vaginitis
- NHS — Vaginal discharge https://www.nhs.uk/conditions/vaginal-discharge/`,

  "appointment-prep": `## Preparing for a healthcare appointment

Making the most of a clinical appointment — especially for gynaecological or menstrual health concerns — takes a little preparation.

### Before your appointment

- **Write down your symptoms**: when they started, how often they occur, what makes them better or worse, and how they affect your life.
- **Track your cycle**: bring dates of your last few periods if possible.
- **List your medications**: including supplements and over-the-counter medicines.
- **Note your questions**: you may forget them in the moment. Write down the 2–3 most important things you want to discuss.

### During your appointment

- Be as specific as possible about symptoms. Use descriptions like "sharp", "dull", "cramping", "constant", or "comes and goes".
- It is okay to say "I'm not sure" or ask for clarification.
- Ask what the next steps are and what to expect.

### After your appointment

- Note any instructions, follow-up dates, or test results to expect.
- If you were not able to discuss everything, call the practice or write to your clinician.

### References

- Patient.info — How to get the most from your GP appointment https://patient.info/
- NHS — How to make the most of your appointment https://www.nhs.uk/nhs-services/gps/`,
};

export default function Education() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>(STATIC_ARTICLES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookmarks, setBookmarks] = useState<string[]>(loadBookmarks);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);

  useEffect(() => {
    api.get<Article[]>("/api/education")
      .then((data) => { if (data && data.length > 0) setArticles(data); })
      .catch(() => { /* use static fallback */ });
  }, []);

  const categories = ["all", ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    const matchSearch = search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  function toggleBookmark(id: string) {
    const next = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(next);
    saveBookmarks(next);
  }

  async function openArticle(id: string) {
    setLoadingArticle(true);
    try {
      const data = await api.get<ArticleDetail>(`/api/education/${id}`);
      setSelectedArticle(data);
    } catch {
      // Build from static
      const art = articles.find((a) => a.id === id);
      if (art) {
        setSelectedArticle({
          ...art,
          content: STATIC_CONTENT[id] || `## ${art.title}\n\n${art.excerpt}\n\n*Full article coming soon.*`,
          references: [],
        });
      }
    } finally {
      setLoadingArticle(false);
    }
  }

  if (selectedArticle) {
    return <ArticlePage article={selectedArticle} isBookmarked={bookmarks.includes(selectedArticle.id)} onToggleBookmark={() => toggleBookmark(selectedArticle.id)} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-2">{t("education.title")}</p>
        <h1 className="text-display-md font-serif text-ink">{t("education.title")}</h1>
        <p className="text-ink/60 mt-2 max-w-xl">{t("education.subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("education.search_placeholder")}
          className="w-full pl-9 pr-10 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              activeCategory === cat
                ? "bg-deep text-white border-deep"
                : "border-border text-ink/60 hover:bg-rose hover:text-deep",
            ].join(" ")}
          >
            {cat === "all" ? t("education.all_categories") : (CATEGORY_KEYS[cat] ? t(`education.categories.${CATEGORY_KEYS[cat]}`) : cat)}
          </button>
        ))}
      </div>

      {/* Bookmarked articles (when no search active) */}
      {search === "" && activeCategory === "all" && bookmarks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-section font-serif text-ink mb-4">{t("education.bookmarks_title")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles
              .filter((a) => bookmarks.includes(a.id))
              .map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  isBookmarked
                  onToggleBookmark={() => toggleBookmark(a.id)}
                  onOpen={() => openArticle(a.id)}
                />
              ))}
          </div>
          <hr className="border-border mt-8 mb-6" />
        </div>
      )}

      {/* Article grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-ink/20 mb-4" />
          <p className="text-lg font-serif text-ink/60 mb-2">{t("education.no_results")}</p>
          <p className="text-sm text-ink/40">{t("education.no_results_hint")}</p>
          <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="mt-4 text-sm text-deep hover:underline">
            {t("education.all_categories")}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              isBookmarked={bookmarks.includes(a.id)}
              onToggleBookmark={() => toggleBookmark(a.id)}
              onOpen={() => openArticle(a.id)}
              loading={loadingArticle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  isBookmarked,
  onToggleBookmark,
  onOpen,
  loading,
}: {
  article: Article;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpen: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const catKey = CATEGORY_KEYS[article.category];
  return (
    <div className="group bg-white rounded-xl border border-border shadow-soft p-5 flex flex-col hover:shadow-softLG transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-deep bg-rose px-2 py-0.5 rounded-full">
          {catKey ? t(`education.categories.${catKey}`) : article.category}
        </span>
        <button
          onClick={onToggleBookmark}
          className="p-1 rounded text-ink/30 hover:text-deep transition-colors"
          aria-label={isBookmarked ? t("education.bookmark_remove") : t("education.bookmark_add")}
        >
          {isBookmarked ? <BookmarkCheck size={16} className="text-deep" /> : <Bookmark size={16} />}
        </button>
      </div>
      <h3 className="font-serif font-semibold text-ink mb-2 leading-snug flex-grow group-hover:text-deep transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-ink/60 leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="flex items-center gap-1 text-xs text-ink/40">
          <Clock size={12} />
          {article.read_time_minutes} {t("education.min_read")}
        </span>
        <button
          onClick={onOpen}
          disabled={loading}
          className="text-xs font-medium text-deep hover:underline disabled:opacity-50"
        >
          {t("education.read_more")} →
        </button>
      </div>
    </div>
  );
}

function ArticlePage({
  article,
  isBookmarked,
  onToggleBookmark,
  onBack,
}: {
  article: ArticleDetail;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const catKey = CATEGORY_KEYS[article.category];

  // Simple markdown renderer
  const renderContent = (md: string) => {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;
    let listItems: string[] = [];

    function flushList() {
      if (listItems.length) {
        elements.push(
          <ul key={key++} className="list-disc pl-5 space-y-1 text-ink/80 text-sm mb-4">
            {listItems.map((li, i) => <li key={i}>{li}</li>)}
          </ul>
        );
        listItems = [];
      }
    }

    for (const line of lines) {
      if (line.startsWith("## ")) {
        flushList();
        elements.push(<h2 key={key++} className="text-xl font-serif font-semibold text-ink mt-6 mb-3">{line.slice(3)}</h2>);
      } else if (line.startsWith("### ")) {
        flushList();
        elements.push(<h3 key={key++} className="font-semibold text-ink mt-4 mb-2">{line.slice(4)}</h3>);
      } else if (line.startsWith("**") && line.endsWith("**")) {
        flushList();
        elements.push(<p key={key++} className="font-semibold text-ink mb-1">{line.slice(2, -2)}</p>);
      } else if (line.startsWith("- ")) {
        listItems.push(line.slice(2));
      } else if (line.startsWith("* ")) {
        // Could be a ref link line
        const refLine = line.slice(2);
        if (refLine.includes("http")) {
          // handled in references section
        } else {
          listItems.push(refLine);
        }
      } else if (line === "") {
        flushList();
        elements.push(<div key={key++} className="mb-2" />);
      } else if (line.startsWith("*") && line.endsWith("*")) {
        flushList();
        elements.push(<p key={key++} className="italic text-ink/60 text-sm mb-2">{line.slice(1, -1)}</p>);
      } else {
        flushList();
        elements.push(<p key={key++} className="text-ink/80 leading-relaxed mb-3 text-sm">{line}</p>);
      }
    }
    flushList();
    return elements;
  };

  return (
    <div className="page-container py-8 max-w-3xl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-deep hover:underline mb-6"
      >
        <ArrowLeft size={15} />
        {t("education.back_to_library")}
      </button>

      <div className="bg-white rounded-xl border border-border shadow-soft p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-xs font-medium text-deep bg-rose px-2 py-0.5 rounded-full">
              {catKey ? t(`education.categories.${catKey}`) : article.category}
            </span>
            <div className="flex items-center gap-2 mt-2 text-xs text-ink/40">
              <Clock size={12} />
              {article.read_time_minutes} {t("education.min_read")}
            </div>
          </div>
          <button
            onClick={onToggleBookmark}
            className="p-2 rounded-lg border border-border hover:bg-rose transition-colors"
            aria-label={isBookmarked ? t("education.bookmark_remove") : t("education.bookmark_add")}
          >
            {isBookmarked ? <BookmarkCheck size={18} className="text-deep" /> : <Bookmark size={18} className="text-ink/50" />}
          </button>
        </div>

        <h1 className="text-display-md font-serif text-ink mb-4">{article.title}</h1>
        <p className="text-ink/60 leading-relaxed mb-8 border-b border-border pb-6">{article.excerpt}</p>

        {/* Disclaimer */}
        <div className="bg-cream rounded-lg p-4 mb-6 text-sm text-deep/80">
          {t("education.disclaimer")}
        </div>

        {/* Content */}
        <div className="prose-like">
          {renderContent(article.content)}
        </div>

        {/* References */}
        {article.references.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-semibold text-ink mb-3">{t("education.sources")}</h3>
            <ul className="space-y-2">
              {article.references.map((ref, i) => (
                <li key={i}>
                  <a href={ref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-deep hover:underline">
                    <ExternalLink size={12} className="shrink-0" />
                    {ref}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
