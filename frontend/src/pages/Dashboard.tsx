import * as React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, MapPin, BookOpen, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { api } from "../lib/api";
import { BRAND_LINE } from "../lib/config";

interface Shortcut {
  key: string;
  label: string;
  description: string;
  href: string;
  coming_soon: boolean;
}

interface DashboardData {
  welcome: string;
  shortcuts: Shortcut[];
  recent_activity: unknown[];
  cycle_overview: {
    last_period_start: string;
    last_flow: string;
    symptoms: string[];
    note: string;
  } | null;
  screening_history: unknown[];
  featured_education: { id: string; href: string }[];
  next_steps: string[];
}

const SHORTCUT_ICONS: Record<string, React.ElementType> = {
  "cycle-tracking": Droplets,
  "anemia-screening": MapPin,
  "health-education": BookOpen,
  reports: FileText,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-10 text-center">
      <CardContent className="p-0 pt-10 pb-10">
        <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink/70 mb-6 max-w-xs mx-auto">{body}</p>
        {action}
      </CardContent>
    </Card>
  );
}

function EmptyStateAction({ children, to }: { children: React.ReactNode; to: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="inline-block px-4 py-2 text-xs font-medium text-deep bg-rose rounded-lg hover:bg-deep hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-baby px-2.5 py-0.5 text-xs font-medium text-deep">
      {children}
    </span>
  );
}
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Could not load your dashboard."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container py-12">
        <div className="animate-pulse rounded-lg bg-baby h-10 w-64 mb-4" />
        <div className="animate-pulse rounded-lg bg-baby h-8 w-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-12 text-center">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-10">
            <h2 className="text-section font-serif text-ink mb-3">Unable to load dashboard</h2>
            <p className="text-sm text-ink/70 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-medium text-deep bg-rose rounded-lg hover:bg-deep hover:text-white transition-colors"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container py-12">
        <div className="animate-pulse rounded-lg bg-baby h-10 w-64 mb-4" />
        <div className="animate-pulse rounded-lg bg-baby h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-sans font-semibold text-pink tracking-wider uppercase mb-1">
            Welcome back
          </p>
          <h1 className="text-display-md font-serif text-ink">{data.welcome}</h1>
          <p className="text-sm text-ink/70 mt-2 max-w-md">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}. {BRAND_LINE}
          </p>
        </div>
      </header>

      <section aria-label="Quick actions">
        <h2 className="text-section mb-6">Start here</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.shortcuts.map((shortcut) => {
            const Icon = SHORTCUT_ICONS[shortcut.key];
            return (
              <Card
                key={shortcut.key}
                className={
                  "group flex flex-col gap-3 p-6 transition-colors hover:bg-rose" +
                  (shortcut.coming_soon ? " bg-white/50" : " bg-white")
                }
              >
                <div className="flex items-center gap-3">
                  {Icon ? <Icon className="shrink-0 w-6 h-6" /> : null}
                  <span className="ml-auto text-xs font-semibold text-pink">
                    {shortcut.coming_soon ? "Coming soon" : "Available"}
                  </span>
                </div>
                <CardTitle>
                  <Link to={shortcut.href} className="text-ink hover:text-deep">
                    {shortcut.label}
                  </Link>
                </CardTitle>
                <CardDescription>{shortcut.description}</CardDescription>
                {shortcut.coming_soon ? (
                  <p className="text-xs text-ink/50 mt-auto">
                    This feature arrives in the next development milestone.
                  </p>
                ) : (
                  <Link
                    to={shortcut.href}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-deep hover:text-deep/80"
                  >
                    Go <ChevronRight size={14} strokeWidth={2} />
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      </section>
      <section className="mt-16" aria-label="Your cycle">
        <h2 className="text-section mb-6">Cycle overview</h2>
        {data.cycle_overview ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-xs font-sans font-semibold text-pink tracking-wider uppercase mb-1">
                    Most recent period
                  </p>
                  <p className="text-lg font-semibold text-ink">
                    {formatDate(data.cycle_overview.last_period_start)}
                  </p>
                  <p className="text-sm text-ink/70 mt-1">
                    Last flow:{" "}
                    <span className="text-deep font-medium capitalize">{data.cycle_overview.last_flow}</span>
                  </p>
                  {data.cycle_overview.symptoms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.cycle_overview.symptoms.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-ink/70 max-w-sm">
                  {data.cycle_overview.note}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No cycle entries yet"
            body="Log your first period start date to see your cycle length and period duration."
            action={
              <EmptyStateAction to="/cycle-tracking">Log a period</EmptyStateAction>
            }
          />
        )}
      </section>

      <section className="mt-16 grid gap-12 lg:grid-cols-2" aria-label="Screening and activity">
        <div>
          <h2 className="text-section mb-6">Screening history</h2>
          {data.screening_history.length > 0 ? (
            <ul className="space-y-4">
              {data.screening_history.map((item, i) => {
                const entry = item as {
                  kind?: string;
                  created_at?: string;
                  status?: string;
                };
                return (
                  <li key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-white">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {String(entry.kind || "screening").charAt(0).toUpperCase() + String(entry.kind || "screening").slice(1)}
                    </p>
                    <p className="text-xs text-ink/50">
                      {new Date(String(entry.created_at)).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-deep bg-cream text-deep/90 px-2.5 py-1 rounded">
                    {String(entry.status).replace(/_/g, " ")}
                  </span>
                </li>
              );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No screening sessions yet"
              body="When you complete an anemia screening, it will appear here with its status. Image analysis is not available yet."
            />
          )}
        </div>

        <div>
          <h2 className="text-section mb-6">Recent activity</h2>
          <EmptyState
            title="Nothing recent yet"
            body="Your cycle entries, screening sessions, and questionnaire summaries will appear here."
            action={
              <EmptyStateAction to="/cycle-tracking">Log a period</EmptyStateAction>
            }
          />
        </div>
      </section>
      <section className="mt-16" aria-label="Suggested reading">
        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-6 mb-6">
          <h2 className="text-section">Suggested reading</h2>
          <Link to="/education" className="text-sm font-medium text-deep hover:underline ml-auto lg:ml-0">
            Browse library &rarr;
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {data.featured_education.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-6">
                <CardTitle className="mb-2">
                  <Link to={article.href} className="text-ink hover:text-deep">
                    {article.id.replace(/-/g, " ")}
                  </Link>
                </CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-lg border border-deep/20 bg-cream p-8 md:p-12 text-deep/90">
        <h2 className="text-section mb-4">Suggested next steps</h2>
        <ul className="space-y-3 text-sm text-deep/80 leading-relaxed">
          {data.next_steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 text-deep">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
