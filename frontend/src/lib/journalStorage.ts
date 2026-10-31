/**
 * Wellness journal storage — localStorage only, never sent to any server.
 */

export type JournalMood = "great" | "good" | "okay" | "low" | "anxious" | "irritable";
export type JournalEnergy = "high" | "normal" | "low" | "exhausted";
export type SleepQuality = "great" | "good" | "fair" | "poor";

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood?: JournalMood;
  energy?: JournalEnergy;
  sleep?: SleepQuality;
  symptoms: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "herhealth-journal";

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save journal:", e);
  }
}

export function getAllEntries(): JournalEntry[] {
  return loadEntries().sort((a, b) => b.date.localeCompare(a.date));
}

export function getEntry(id: string): JournalEntry | undefined {
  return loadEntries().find((e) => e.id === id);
}

export function getEntryForDate(date: string): JournalEntry | undefined {
  return loadEntries().find((e) => e.date === date);
}

export function saveEntry(
  entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }
): JournalEntry {
  const entries = loadEntries();
  const now = new Date().toISOString();

  if (entry.id) {
    const existing = entries.find((e) => e.id === entry.id);
    if (existing) {
      const updated: JournalEntry = { ...existing, ...entry, id: entry.id, updatedAt: now };
      saveEntries(entries.map((e) => (e.id === entry.id ? updated : e)));
      return updated;
    }
  }

  // Check for same-date entry
  const sameDate = entries.find((e) => e.date === entry.date && !entry.id);
  if (sameDate) {
    const updated: JournalEntry = { ...sameDate, ...entry, id: sameDate.id, updatedAt: now };
    saveEntries(entries.map((e) => (e.id === sameDate.id ? updated : e)));
    return updated;
  }

  const newEntry: JournalEntry = {
    ...entry,
    id: `journal-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  saveEntries([...entries, newEntry]);
  return newEntry;
}

export function deleteEntry(id: string): void {
  saveEntries(loadEntries().filter((e) => e.id !== id));
}

export interface JournalInsights {
  totalEntries: number;
  mostCommonMood: JournalMood | null;
  mostCommonEnergy: JournalEnergy | null;
  frequentSymptoms: string[];
}

export function getInsights(): JournalInsights {
  const entries = loadEntries();
  if (entries.length === 0) {
    return { totalEntries: 0, mostCommonMood: null, mostCommonEnergy: null, frequentSymptoms: [] };
  }

  const moodCounts: Record<string, number> = {};
  const energyCounts: Record<string, number> = {};
  const symptomCounts: Record<string, number> = {};

  for (const e of entries) {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    if (e.energy) energyCounts[e.energy] = (energyCounts[e.energy] || 0) + 1;
    for (const s of e.symptoms) {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    }
  }

  const mostCommonMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null) as JournalMood | null;
  const mostCommonEnergy = (Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null) as JournalEnergy | null;
  const frequentSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .filter(([, count]) => count >= 2)
    .map(([s]) => s);

  return { totalEntries: entries.length, mostCommonMood, mostCommonEnergy, frequentSymptoms };
}
