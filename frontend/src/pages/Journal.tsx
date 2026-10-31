import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit3, Trash2, X, TrendingUp, Smile, Zap, AlertCircle } from "lucide-react";
import {
  getAllEntries,
  saveEntry,
  deleteEntry,
  getInsights,
  type JournalEntry,
  type JournalMood,
  type JournalEnergy,
  type SleepQuality,
} from "../lib/journalStorage";

const MOOD_OPTS: JournalMood[] = ["great", "good", "okay", "low", "anxious", "irritable"];
const ENERGY_OPTS: JournalEnergy[] = ["high", "normal", "low", "exhausted"];
const SLEEP_OPTS: SleepQuality[] = ["great", "good", "fair", "poor"];
const SYMPTOM_OPTS = ["headache", "bloating", "fatigue", "acne", "breast_tenderness", "nausea", "back_pain", "mood_swings", "insomnia"];

const MOOD_EMOJI: Record<JournalMood, string> = {
  great: "😊", good: "🙂", okay: "😐", low: "😔", anxious: "😰", irritable: "😤",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function Journal() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState(() => getInsights());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function reload() {
    setEntries(getAllEntries());
    setInsights(getInsights());
  }

  useEffect(() => { reload(); }, []);

  function handleSave(data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    saveEntry(data);
    reload();
    setShowForm(false);
    setEditingEntry(null);
  }

  function handleDelete(id: string) {
    deleteEntry(id);
    reload();
    setDeleteConfirm(null);
  }

  return (
    <div className="page-container py-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-2">{t("journal.title")}</p>
          <h1 className="text-display-md font-serif text-ink">{t("journal.title")}</h1>
          <p className="text-ink/60 mt-2 max-w-xl">{t("journal.subtitle")}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingEntry(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors"
        >
          <Plus size={16} />
          {t("journal.new_entry")}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Entries column */}
        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <EntryForm
              existing={editingEntry ?? undefined}
              defaultDate={todayISO()}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingEntry(null); }}
            />
          )}

          {entries.length === 0 && !showForm ? (
            <div className="text-center py-16 bg-white rounded-xl border border-border">
              <div className="text-4xl mb-4">📓</div>
              <p className="font-serif text-lg text-ink/60 mb-2">{t("journal.no_entries")}</p>
              <p className="text-sm text-ink/40 mb-6">{t("journal.no_entries_hint")}</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors"
              >
                <Plus size={15} />
                {t("journal.new_entry")}
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => { setEditingEntry(entry); setShowForm(true); }}
                onDeleteRequest={() => setDeleteConfirm(entry.id)}
              />
            ))
          )}
        </div>

        {/* Insights sidebar */}
        <div className="space-y-4">
          {insights.totalEntries >= 3 && (
            <div className="bg-white rounded-xl border border-border shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-deep" />
                <h3 className="font-serif font-semibold text-ink">{t("journal.insights_title")}</h3>
              </div>
              <div className="space-y-4">
                {insights.mostCommonMood && (
                  <InsightRow
                    icon={<Smile size={15} className="text-deep" />}
                    label={t("journal.most_common_mood")}
                    value={`${MOOD_EMOJI[insights.mostCommonMood]} ${t(`journal.mood.${insights.mostCommonMood}`)}`}
                  />
                )}
                {insights.mostCommonEnergy && (
                  <InsightRow
                    icon={<Zap size={15} className="text-deep" />}
                    label={t("journal.most_common_energy")}
                    value={t(`journal.energy.${insights.mostCommonEnergy}`)}
                  />
                )}
                {insights.frequentSymptoms.length > 0 && (
                  <div>
                    <p className="text-xs text-ink/50 mb-2">{t("journal.frequent_symptoms")}</p>
                    <div className="flex flex-wrap gap-1">
                      {insights.frequentSymptoms.map((s) => (
                        <span key={s} className="text-xs bg-rose text-deep px-2 py-0.5 rounded-full">
                          {t(`cycle.symptom_options.${s}`, s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-ink/40 mt-4 leading-relaxed">{t("journal.insights_disclaimer")}</p>
            </div>
          )}

          <div className="bg-cream rounded-xl border border-border p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-deep mt-0.5 shrink-0" />
              <p className="text-xs text-ink/70 leading-relaxed">{t("journal.privacy_note")}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-ink/40">{insights.totalEntries} {t("journal.entries_count")}</p>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-border shadow-softLG p-6 max-w-sm w-full">
            <p className="text-sm text-ink mb-4">{t("journal.delete_confirm")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                {t("journal.delete")}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-border text-sm rounded-lg hover:bg-rose"
              >
                {t("journal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink/50">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDeleteRequest,
}: {
  entry: JournalEntry;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-border shadow-soft p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-ink/40 mb-0.5">{formatDisplayDate(entry.date)}</p>
          {entry.mood && (
            <p className="text-base">
              {MOOD_EMOJI[entry.mood]}
              <span className="text-sm text-ink/70 ml-2">{t(`journal.mood.${entry.mood}`)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-rose text-ink/40 hover:text-deep transition-colors">
            <Edit3 size={14} />
          </button>
          <button onClick={onDeleteRequest} className="p-1.5 rounded hover:bg-red-50 text-ink/40 hover:text-red-600 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {entry.energy && (
          <span className="text-xs bg-sage/30 text-ink px-2 py-0.5 rounded-full">
            ⚡ {t(`journal.energy.${entry.energy}`)}
          </span>
        )}
        {entry.sleep && (
          <span className="text-xs bg-baby text-deep px-2 py-0.5 rounded-full">
            😴 {t(`journal.sleep_options.${entry.sleep}`)}
          </span>
        )}
        {entry.symptoms.map((s) => (
          <span key={s} className="text-xs bg-rose text-deep px-2 py-0.5 rounded-full">
            {t(`cycle.symptom_options.${s}`, s)}
          </span>
        ))}
      </div>

      {entry.notes && (
        <p className="text-sm text-ink/70 leading-relaxed line-clamp-3">{entry.notes}</p>
      )}
    </div>
  );
}

function EntryForm({
  existing,
  defaultDate,
  onSave,
  onCancel,
}: {
  existing?: JournalEntry;
  defaultDate: string;
  onSave: (data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [date, setDate] = useState(existing?.date ?? defaultDate);
  const [mood, setMood] = useState<JournalMood | "">(existing?.mood ?? "");
  const [energy, setEnergy] = useState<JournalEnergy | "">(existing?.energy ?? "");
  const [sleep, setSleep] = useState<SleepQuality | "">(existing?.sleep ?? "");
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: existing?.id,
      date,
      mood: mood || undefined,
      energy: energy || undefined,
      sleep: sleep || undefined,
      symptoms,
      notes,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-ink">{existing ? t("journal.edit_entry") : t("journal.new_entry")}</h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-rose text-ink/40"><X size={16} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-ink/60 mb-1">{t("journal.date_label")}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayISO()}
            className="text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
          />
        </div>

        {/* Mood */}
        <div>
          <p className="text-xs text-ink/60 mb-2">{t("journal.mood_label")}</p>
          <div className="flex gap-2 flex-wrap">
            {MOOD_OPTS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m === mood ? "" : m)}
                className={["px-3 py-1 text-xs rounded-full border transition-colors",
                  mood === m ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose"
                ].join(" ")}
              >
                {MOOD_EMOJI[m]} {t(`journal.mood.${m}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div>
          <p className="text-xs text-ink/60 mb-2">{t("journal.energy_label")}</p>
          <div className="flex gap-2 flex-wrap">
            {ENERGY_OPTS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEnergy(e === energy ? "" : e)}
                className={["px-3 py-1 text-xs rounded-full border transition-colors",
                  energy === e ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose"
                ].join(" ")}
              >
                {t(`journal.energy.${e}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div>
          <p className="text-xs text-ink/60 mb-2">{t("journal.sleep_label")}</p>
          <div className="flex gap-2 flex-wrap">
            {SLEEP_OPTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSleep(s === sleep ? "" : s)}
                className={["px-3 py-1 text-xs rounded-full border transition-colors",
                  sleep === s ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose"
                ].join(" ")}
              >
                {t(`journal.sleep_options.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <p className="text-xs text-ink/60 mb-2">{t("journal.symptoms_label")}</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={["px-2.5 py-1 text-xs rounded-full border transition-colors",
                  symptoms.includes(s) ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose"
                ].join(" ")}
              >
                {t(`cycle.symptom_options.${s}`, s)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-ink/60 mb-1">{t("journal.notes_label")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("journal.notes_placeholder")}
            rows={4}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink bg-blush resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors">
            {t("journal.save")}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-rose">
            {t("journal.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
