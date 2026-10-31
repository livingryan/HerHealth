import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit3, X, Info } from "lucide-react";
import {
  getAllDays,
  getDayEntry,
  saveDayEntry,
  deleteDayEntry,
  getCycleEstimates,
  getPeriodRuns,
  formatDate,
  formatShortDate,
  todayISO,
  addDays,
  type CycleDay,
  type FlowLevel,
  type MoodOption,
  type EnergyOption,
} from "../lib/cycleStorage";

// ---- helpers ----
function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const SYMPTOM_KEYS = [
  "headache","bloating","fatigue","acne","breast_tenderness","nausea","back_pain","mood_swings","insomnia",
];
const FLOW_OPTS: FlowLevel[] = ["spotting","light","medium","heavy"];
const MOOD_OPTS: MoodOption[] = ["great","good","okay","low","anxious","irritable"];
const ENERGY_OPTS: EnergyOption[] = ["high","normal","low","exhausted"];

// ---- Day marker types ----
interface DayMeta {
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isToday: boolean;
  hasEntry: boolean;
  flow?: FlowLevel;
}

export default function CycleTracking() {
  const { t, i18n } = useTranslation();
  const today = todayISO();

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<CycleDay[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [estimates, setEstimates] = useState(() => getCycleEstimates());
  const [runs, setRuns] = useState(() => getPeriodRuns());

  const reload = useCallback(() => {
    setEntries(getAllDays());
    setEstimates(getCycleEstimates());
    setRuns(getPeriodRuns());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Build set of all period days for quick lookup
  const periodDaySet = new Set(entries.filter((e) => e.isPeriod).map((e) => e.date));

  // Predicted period days
  const predictedDays = new Set<string>();
  if (estimates.nextPeriodStart && estimates.avgPeriodDuration) {
    for (let i = 0; i < estimates.avgPeriodDuration; i++) {
      predictedDays.add(addDays(estimates.nextPeriodStart, i));
    }
  }

  // Fertile + ovulation
  const fertileDays = new Set<string>();
  if (estimates.fertileWindowStart && estimates.fertileWindowEnd) {
    let d = estimates.fertileWindowStart;
    while (d <= estimates.fertileWindowEnd!) {
      fertileDays.add(d);
      d = addDays(d, 1);
    }
  }

  function getDayMeta(dateStr: string): DayMeta {
    const entry = entries.find((e) => e.date === dateStr);
    return {
      isPeriod: periodDaySet.has(dateStr),
      isPredictedPeriod: !periodDaySet.has(dateStr) && predictedDays.has(dateStr),
      isFertile: fertileDays.has(dateStr) && dateStr !== estimates.ovulationDate,
      isOvulation: dateStr === estimates.ovulationDate,
      isToday: dateStr === today,
      hasEntry: !!entry,
      flow: entry?.flow,
    };
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(dateToISO(new Date(viewYear, viewMonth, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const selectedEntry = selectedDate ? getDayEntry(selectedDate) : undefined;

  function handleDateClick(dateStr: string) {
    setSelectedDate(dateStr);
    setShowForm(false);
    setDeleteConfirm(false);
  }

  function handleDelete() {
    if (!selectedDate) return;
    deleteDayEntry(selectedDate);
    reload();
    setSelectedDate(null);
    setDeleteConfirm(false);
  }

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-2">
          {t("cycle.title")}
        </p>
        <h1 className="text-display-md font-serif text-ink">{t("cycle.title")}</h1>
        <p className="text-ink/60 mt-2 max-w-xl">{t("cycle.subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border shadow-soft p-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-rose transition-colors"
                aria-label={t("cycle.calendar_nav_prev")}
              >
                <ChevronLeft size={20} className="text-ink/70" />
              </button>
              <h2 className="text-lg font-serif font-semibold text-ink">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-rose transition-colors"
                aria-label={t("cycle.calendar_nav_next")}
              >
                <ChevronRight size={20} className="text-ink/70" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-ink/40 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} />;
                }
                const meta = getDayMeta(dateStr);
                const dayNum = parseInt(dateStr.split("-")[2] || "1", 10);
                const isSelected = selectedDate === dateStr;

                let bg = "";
                let textColor = "text-ink/70";
                if (meta.isPeriod) { bg = "bg-deep"; textColor = "text-white"; }
                else if (meta.isPredictedPeriod) { bg = "bg-baby border border-deep/30"; textColor = "text-deep"; }
                else if (meta.isOvulation) { bg = "bg-sage"; textColor = "text-ink"; }
                else if (meta.isFertile) { bg = "bg-sage/40"; textColor = "text-ink"; }
                if (isSelected && !meta.isPeriod) { bg = "bg-pink/30 ring-2 ring-pink"; }
                if (isSelected && meta.isPeriod) { bg = "bg-deep ring-2 ring-deep/50"; }

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className={[
                      "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                      bg || "hover:bg-rose",
                      textColor,
                      meta.isToday && !meta.isPeriod ? "font-bold" : "",
                    ].filter(Boolean).join(" ")}
                    aria-label={dateStr}
                  >
                    <span>{dayNum}</span>
                    {meta.isToday && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${meta.isPeriod ? "bg-white" : "bg-deep"}`} />
                    )}
                    {meta.hasEntry && !meta.isPeriod && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pink" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
              {[
                { color: "bg-deep", label: t("cycle.legend.period") },
                { color: "bg-baby border border-deep/30", label: t("cycle.legend.predicted") },
                { color: "bg-sage/40", label: t("cycle.legend.fertile") },
                { color: "bg-sage", label: t("cycle.legend.ovulation") },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-ink/60">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Estimates */}
          <div className="mt-6 bg-white rounded-xl border border-border shadow-soft p-6">
            <h3 className="font-serif text-lg font-semibold text-ink mb-4">{t("cycle.estimates_title")}</h3>
            {estimates.hasEnoughData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {estimates.avgCycleLength && (
                  <EstimateStat label={t("cycle.avg_cycle_length")} value={`${estimates.avgCycleLength} ${t("cycle.days")}`} />
                )}
                {estimates.avgPeriodDuration && (
                  <EstimateStat label={t("cycle.avg_period_duration")} value={`${estimates.avgPeriodDuration} ${t("cycle.days")}`} />
                )}
                {estimates.nextPeriodStart && (
                  <EstimateStat label={t("cycle.next_period_est")} value={formatShortDate(estimates.nextPeriodStart)} />
                )}
                {estimates.ovulationDate && (
                  <EstimateStat label={t("cycle.ovulation_est")} value={formatShortDate(estimates.ovulationDate)} />
                )}
                {estimates.fertileWindowStart && estimates.fertileWindowEnd && (
                  <EstimateStat
                    label={t("cycle.fertile_window_est")}
                    value={`${formatShortDate(estimates.fertileWindowStart)} – ${formatShortDate(estimates.fertileWindowEnd)}`}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-baby/40 rounded-lg">
                <Info size={16} className="text-deep mt-0.5 shrink-0" />
                <p className="text-sm text-ink/70">{t("cycle.insufficient_data")}</p>
              </div>
            )}
            {estimates.hasEnoughData && (
              <p className="mt-4 text-xs text-ink/50 leading-relaxed">{t("cycle.estimates_disclaimer")}</p>
            )}
          </div>
        </div>

        {/* Sidebar: selected day + history */}
        <div className="space-y-6">
          {/* Selected day panel */}
          <div className="bg-white rounded-xl border border-border shadow-soft p-6">
            {selectedDate ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-ink/50 uppercase tracking-wider mb-1">{t("cycle.log_entry")}</p>
                    <h3 className="font-serif font-semibold text-ink">{formatDate(selectedDate, i18n.language)}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 rounded hover:bg-rose text-ink/40 hover:text-ink"
                    aria-label={t("common.close")}
                  >
                    <X size={16} />
                  </button>
                </div>

                {showForm ? (
                  <EntryForm
                    date={selectedDate}
                    existing={selectedEntry}
                    onSave={() => { reload(); setShowForm(false); }}
                    onCancel={() => setShowForm(false)}
                  />
                ) : selectedEntry ? (
                  <EntryView
                    entry={selectedEntry}
                    onEdit={() => setShowForm(true)}
                    onDeleteRequest={() => setDeleteConfirm(true)}
                  />
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-ink/50 mb-4">{t("cycle.no_entry")}</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors"
                    >
                      <Plus size={15} />
                      {t("cycle.add_entry")}
                    </button>
                  </div>
                )}

                {/* Delete confirm */}
                {deleteConfirm && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 mb-3">{t("cycle.delete_confirm")}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                      >
                        {t("common.delete")}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-border text-xs rounded-lg hover:bg-rose"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-ink/50">{t("cycle.no_entry")}</p>
                <p className="text-xs text-ink/40 mt-1">Select a date on the calendar</p>
              </div>
            )}
          </div>

          {/* Cycle history */}
          <div className="bg-white rounded-xl border border-border shadow-soft p-6">
            <h3 className="font-serif font-semibold text-ink mb-4">{t("cycle.history_title")}</h3>
            {runs.length === 0 ? (
              <p className="text-sm text-ink/50">{t("cycle.no_history")}</p>
            ) : (
              <div className="space-y-3">
                {[...runs].reverse().slice(0, 6).map((run) => (
                  <div key={run.startDate} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{formatShortDate(run.startDate)}</p>
                      {run.endDate !== run.startDate && (
                        <p className="text-xs text-ink/50">→ {formatShortDate(run.endDate)}</p>
                      )}
                    </div>
                    <span className="text-xs bg-baby text-deep font-medium px-2 py-0.5 rounded-full">
                      {run.durationDays} {t("cycle.days")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function EstimateStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-blush rounded-lg p-3">
      <p className="text-xs text-ink/50 mb-1">{label}</p>
      <p className="text-sm font-semibold text-deep">{value}</p>
    </div>
  );
}

function EntryView({
  entry,
  onEdit,
  onDeleteRequest,
}: {
  entry: CycleDay;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      {entry.isPeriod && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-deep" />
          <span className="text-sm font-medium text-deep">{t("cycle.legend.period")}</span>
          {entry.flow && (
            <span className="text-xs bg-baby text-deep px-2 py-0.5 rounded-full capitalize">
              {t(`cycle.flow.${entry.flow}`)}
            </span>
          )}
        </div>
      )}
      {entry.mood && (
        <InfoRow label={t("cycle.mood")} value={t(`cycle.mood_options.${entry.mood}`)} />
      )}
      {entry.energy && (
        <InfoRow label={t("cycle.energy")} value={t(`cycle.energy_options.${entry.energy}`)} />
      )}
      {entry.cramps && (
        <InfoRow label={t("cycle.cramps")} value={entry.painLevel !== undefined ? `${entry.painLevel}/10` : "Yes"} />
      )}
      {entry.symptoms.length > 0 && (
        <div>
          <p className="text-xs text-ink/50 mb-1">{t("cycle.symptoms")}</p>
          <div className="flex flex-wrap gap-1">
            {entry.symptoms.map((s) => (
              <span key={s} className="text-xs bg-rose text-deep px-2 py-0.5 rounded-full">
                {t(`cycle.symptom_options.${s}`, s)}
              </span>
            ))}
          </div>
        </div>
      )}
      {entry.notes && (
        <div>
          <p className="text-xs text-ink/50 mb-1">{t("cycle.notes")}</p>
          <p className="text-sm text-ink/80 leading-relaxed">{entry.notes}</p>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose text-deep text-xs rounded-lg hover:bg-baby transition-colors"
        >
          <Edit3 size={13} /> {t("common.edit")}
        </button>
        <button
          onClick={onDeleteRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} /> {t("common.delete")}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink/50">{label}</span>
      <span className="font-medium text-ink capitalize">{value}</span>
    </div>
  );
}

function EntryForm({
  date,
  existing,
  onSave,
  onCancel,
}: {
  date: string;
  existing?: CycleDay;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [isPeriod, setIsPeriod] = useState(existing?.isPeriod ?? false);
  const [flow, setFlow] = useState<FlowLevel | "">(existing?.flow ?? "");
  const [cramps, setCramps] = useState(existing?.cramps ?? false);
  const [painLevel, setPainLevel] = useState<number>(existing?.painLevel ?? 0);
  const [mood, setMood] = useState<MoodOption | "">(existing?.mood ?? "");
  const [energy, setEnergy] = useState<EnergyOption | "">(existing?.energy ?? "");
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveDayEntry({
      date,
      isPeriod,
      flow: flow || undefined,
      cramps,
      painLevel: cramps ? painLevel : undefined,
      mood: mood || undefined,
      energy: energy || undefined,
      symptoms,
      notes,
    });
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Period toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPeriod}
          onChange={(e) => setIsPeriod(e.target.checked)}
          className="w-4 h-4 accent-deep"
        />
        <span className="text-sm font-medium text-ink">{t("cycle.period_start")}</span>
      </label>

      {isPeriod && (
        <div>
          <p className="text-xs text-ink/60 mb-2">{t("cycle.flow_label")}</p>
          <div className="flex gap-2 flex-wrap">
            {FLOW_OPTS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlow(f)}
                className={[
                  "px-3 py-1 text-xs rounded-full border transition-colors",
                  flow === f ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose",
                ].join(" ")}
              >
                {t(`cycle.flow.${f}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mood */}
      <div>
        <p className="text-xs text-ink/60 mb-2">{t("cycle.mood")}</p>
        <div className="flex gap-2 flex-wrap">
          {MOOD_OPTS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m === mood ? "" : m)}
              className={[
                "px-3 py-1 text-xs rounded-full border transition-colors",
                mood === m ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose",
              ].join(" ")}
            >
              {t(`cycle.mood_options.${m}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div>
        <p className="text-xs text-ink/60 mb-2">{t("cycle.energy")}</p>
        <div className="flex gap-2 flex-wrap">
          {ENERGY_OPTS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEnergy(e === energy ? "" : e)}
              className={[
                "px-3 py-1 text-xs rounded-full border transition-colors",
                energy === e ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose",
              ].join(" ")}
            >
              {t(`cycle.energy_options.${e}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Cramps */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={cramps}
          onChange={(e) => setCramps(e.target.checked)}
          className="w-4 h-4 accent-deep"
        />
        <span className="text-sm text-ink">{t("cycle.cramps")}</span>
      </label>
      {cramps && (
        <div>
          <p className="text-xs text-ink/60 mb-1">{t("cycle.pain_level")}: {painLevel}</p>
          <input
            type="range"
            min={0}
            max={10}
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="w-full accent-deep"
          />
        </div>
      )}

      {/* Symptoms */}
      <div>
        <p className="text-xs text-ink/60 mb-2">{t("cycle.symptoms")}</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_KEYS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSymptom(s)}
              className={[
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                symptoms.includes(s) ? "bg-deep text-white border-deep" : "border-border text-ink/60 hover:bg-rose",
              ].join(" ")}
            >
              {t(`cycle.symptom_options.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-ink/60 mb-1">{t("cycle.notes")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("cycle.notes_placeholder")}
          rows={3}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink bg-blush resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors"
        >
          {t("cycle.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-rose transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
