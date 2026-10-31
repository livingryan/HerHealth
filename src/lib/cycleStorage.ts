/**
 * Cycle data persistence and calculations.
 * All data stored in localStorage — no server dependency for basic tracking.
 */

export type FlowLevel = "spotting" | "light" | "medium" | "heavy";
export type MoodOption = "great" | "good" | "okay" | "low" | "anxious" | "irritable";
export type EnergyOption = "high" | "normal" | "low" | "exhausted";

export interface CycleDay {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  isPeriod: boolean;
  flow?: FlowLevel;
  cramps: boolean;
  painLevel?: number; // 0-10
  mood?: MoodOption;
  energy?: EnergyOption;
  symptoms: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "herhealth-cycle-days";

function loadDays(): CycleDay[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CycleDay[];
  } catch {
    return [];
  }
}

function saveDays(days: CycleDay[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  } catch (e) {
    console.error("Failed to save cycle data:", e);
  }
}

export function getAllDays(): CycleDay[] {
  return loadDays().sort((a, b) => a.date.localeCompare(b.date));
}

export function getDayEntry(date: string): CycleDay | undefined {
  return loadDays().find((d) => d.date === date);
}

export function saveDayEntry(entry: Omit<CycleDay, "id" | "createdAt" | "updatedAt">): CycleDay {
  const days = loadDays();
  const existing = days.find((d) => d.date === entry.date);
  const now = new Date().toISOString();

  if (existing) {
    const updated: CycleDay = { ...existing, ...entry, updatedAt: now };
    const newDays = days.map((d) => (d.date === entry.date ? updated : d));
    saveDays(newDays);
    return updated;
  } else {
    const newEntry: CycleDay = {
      ...entry,
      id: `${entry.date}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    saveDays([...days, newEntry]);
    return newEntry;
  }
}

export function deleteDayEntry(date: string): void {
  const days = loadDays().filter((d) => d.date !== date);
  saveDays(days);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Cycle calculations ----

/** Get all distinct "period runs" — groups of consecutive period days. */
export interface PeriodRun {
  startDate: string;
  endDate: string;
  durationDays: number;
}

export function getPeriodRuns(): PeriodRun[] {
  const periodDays = getAllDays()
    .filter((d) => d.isPeriod)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (periodDays.length === 0) return [];

  const runs: PeriodRun[] = [];
  let runStart = periodDays[0]!.date;
  let runLast = periodDays[0]!.date;

  for (let i = 1; i < periodDays.length; i++) {
    const prev = new Date(runLast);
    const cur = new Date(periodDays[i]!.date);
    const gap = (cur.getTime() - prev.getTime()) / 86400000;
    if (gap <= 2) {
      runLast = periodDays[i]!.date;
    } else {
      runs.push(buildRun(runStart, runLast));
      runStart = periodDays[i]!.date;
      runLast = periodDays[i]!.date;
    }
  }
  runs.push(buildRun(runStart, runLast));
  return runs;
}

function buildRun(startDate: string, endDate: string): PeriodRun {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return { startDate, endDate, durationDays };
}

export interface CycleEstimates {
  avgCycleLength: number | null;
  avgPeriodDuration: number | null;
  nextPeriodStart: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  ovulationDate: string | null;
  hasEnoughData: boolean;
}

export function getCycleEstimates(): CycleEstimates {
  const runs = getPeriodRuns();

  if (runs.length < 2) {
    return {
      avgCycleLength: null,
      avgPeriodDuration: null,
      nextPeriodStart: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      ovulationDate: null,
      hasEnoughData: false,
    };
  }

  // Cycle lengths: gap between consecutive period starts
  const cycleLengths: number[] = [];
  for (let i = 1; i < runs.length; i++) {
    const prev = new Date(runs[i - 1]!.startDate);
    const cur = new Date(runs[i]!.startDate);
    const days = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (days >= 14 && days <= 60) {
      cycleLengths.push(days);
    }
  }

  if (cycleLengths.length === 0) {
    return {
      avgCycleLength: null,
      avgPeriodDuration: null,
      nextPeriodStart: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      ovulationDate: null,
      hasEnoughData: false,
    };
  }

  const avgCycleLength = Math.round(
    cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
  );
  const avgPeriodDuration = Math.round(
    runs.reduce((a, r) => a + r.durationDays, 0) / runs.length
  );

  const lastRun = runs[runs.length - 1];
  if (!lastRun) {
    return { avgCycleLength: null, avgPeriodDuration: null, nextPeriodStart: null, fertileWindowStart: null, fertileWindowEnd: null, ovulationDate: null, hasEnoughData: false };
  }

  const lastStart = new Date(lastRun.startDate);

  // Next period start
  const nextStart = new Date(lastStart);
  nextStart.setDate(nextStart.getDate() + avgCycleLength);

  // Ovulation: typically ~14 days before next period
  const ovulation = new Date(nextStart);
  ovulation.setDate(ovulation.getDate() - 14);

  // Fertile window: ~4 days before ovulation through 1 day after
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 4);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  return {
    avgCycleLength,
    avgPeriodDuration,
    nextPeriodStart: toISO(nextStart),
    fertileWindowStart: toISO(fertileStart),
    fertileWindowEnd: toISO(fertileEnd),
    ovulationDate: toISO(ovulation),
    hasEnoughData: true,
  };
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function formatDate(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleDateString(locale || undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleDateString(locale || undefined, {
    month: "short",
    day: "numeric",
  });
}

export function todayISO(): string {
  return toISO(new Date());
}
