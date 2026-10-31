import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, AlertTriangle, Info } from "lucide-react";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

function emptyUpload(): UploadState {
  return { file: null, preview: null, error: null };
}

export default function ImageTesting() {
  const { t } = useTranslation();
  const [consented, setConsented] = useState(false);
  const [eye, setEye] = useState<UploadState>(emptyUpload());
  const [nail, setNail] = useState<UploadState>(emptyUpload());
  const [tested, setTested] = useState(false);

  const eyeRef = useRef<HTMLInputElement>(null);
  const nailRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null, setter: (s: UploadState) => void) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setter({
        file: null,
        preview: null,
        error: t("forms.upload.type_limit", { types: t("forms.upload.supported") }),
      });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setter({ file: null, preview: null, error: t("forms.upload.size_limit", { max_size: MAX_SIZE_MB }) });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setter({ file, preview: ev.target?.result as string, error: null });
    };
    reader.readAsDataURL(file);
  }

  function handleTest(e: React.FormEvent) {
    e.preventDefault();
    setTested(true);
  }

  if (tested) {
    return (
      <div className="page-container py-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-border shadow-soft p-10 text-center">
          <Info size={40} className="mx-auto text-deep mb-4" />
          <h2 className="font-serif text-section text-ink mb-3">{t("image_testing.not_connected")}</h2>
          <p className="text-sm text-ink/70 leading-relaxed mb-6">
            {t("image_testing.not_connected_text")}
          </p>
          <p className="text-sm font-semibold text-deep mb-2">{t("screening.limitation")}</p>
          <p className="text-sm text-ink/70 leading-relaxed mb-6">
            {t("screening.limitation_text")}
          </p>
          <button
            type="button"
            onClick={() => setTested(false)}
            className="px-5 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors"
          >
            {t("image_testing.start_over")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-2">
          {t("image_testing.title")}
        </p>
        <h1 className="text-display-md font-serif text-ink">{t("image_testing.title")}</h1>
        <p className="text-ink/60 mt-2">{t("image_testing.subtitle")}</p>
      </div>

      {/* Prototype notice */}
      <div className="bg-cream border border-deep/20 rounded-xl p-5 mb-6 flex items-start gap-3">
        <AlertTriangle size={18} className="text-deep mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-deep">{t("screening.prototype_note")}</p>
        </div>
      </div>

      {/* Consent */}
      <label className="mb-6 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-deep shrink-0"
        />
        <div>
          <p className="text-sm font-semibold text-deep">{t("screening.consent_heading")}</p>
          <p className="text-sm text-ink">{t("screening.consent_text")}</p>
        </div>
      </label>

      {/* Upload form */}
      <form onSubmit={handleTest} className={!consented ? "opacity-50 pointer-events-none" : ""}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <UploadZone
            label={t("screening.upload_eyelid")}
            guidance={t("screening.guidance_eyelid")}
            state={eye}
            inputRef={eyeRef}
            onFile={(file) => handleFile(file, setEye)}
            onRemove={() => setEye(emptyUpload())}
          />
          <UploadZone
            label={t("screening.upload_nail")}
            guidance={t("screening.guidance_nail")}
            state={nail}
            inputRef={nailRef}
            onFile={(file) => handleFile(file, setNail)}
            onRemove={() => setNail(emptyUpload())}
          />
        </div>

        <button
          type="submit"
          disabled={!consented || (!eye.file && !nail.file)}
          className="w-full py-3 bg-deep text-white text-sm font-medium rounded-lg hover:bg-pink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("image_testing.start_testing")}
        </button>
      </form>
    </div>
  );
}

function UploadZone({
  label,
  guidance,
  state,
  inputRef,
  onFile,
  onRemove,
}: {
  label: string;
  guidance: string;
  state: UploadState;
  inputRef: React.RefObject<HTMLInputElement>;
  onFile: (file: File | null) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFile(files[0] ?? null);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{label}</p>
      <p className="text-xs text-ink/50 mb-3 leading-relaxed">{guidance}</p>

      {state.preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img src={state.preview} alt="Upload preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-ink/60 text-white hover:bg-ink transition-colors"
            aria-label={t("forms.upload.remove")}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={t("forms.upload.drop_zone")}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`w-full h-36 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 ${
            dragging
              ? "border-pink bg-rose/10 text-deep"
              : "border-border hover:border-pink bg-blush hover:bg-rose hover:text-deep text-ink/50"
          }`}
        >
          <Upload size={24} />
          <span className="text-xs">{t("forms.upload.drop_zone")}</span>
          <span className="text-xs text-deep font-medium">{t("forms.upload.browse")}</span>
        </div>
      )}

      {state.error && (
        <p className="text-xs text-red-600 mt-2">{state.error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </div>
  );
}
