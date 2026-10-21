import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, AlertTriangle, Info, CheckCircle } from "lucide-react";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

function emptyUpload(): UploadState {
  return { file: null, preview: null, error: null };
}

export default function AnemiaScreening() {
  const { t } = useTranslation();
  const [consented, setConsented] = useState(false);
  const [eyelid, setEyelid] = useState<UploadState>(emptyUpload());
  const [nail, setNail] = useState<UploadState>(emptyUpload());
  const [submitted, setSubmitted] = useState(false);

  const eyelidRef = useRef<HTMLInputElement>(null);
  const nailRef = useRef<HTMLInputElement>(null);

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (s: UploadState) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setter({ file: null, preview: null, error: t("forms.upload.type_limit", { types: "JPEG, PNG, WebP" }) });
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eyelid.file && !nail.file) return;
    // No image is uploaded to any server. We just record intent.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page-container py-12 max-w-lg">
        <div className="bg-white rounded-xl border border-border shadow-soft p-10 text-center">
          <CheckCircle size={40} className="mx-auto text-sage mb-4" />
          <h2 className="font-serif text-section text-ink mb-3">Images received (locally)</h2>
          <p className="text-sm text-ink/70 leading-relaxed mb-6">
            Your images have been validated locally. No image content has been sent to any server or analyzed by any model.
            Image analysis is not available in this prototype. Please consult a clinician for any health concerns.
          </p>
          <button
            onClick={() => { setSubmitted(false); setEyelid(emptyUpload()); setNail(emptyUpload()); setConsented(false); }}
            className="px-5 py-2 bg-deep text-white text-sm rounded-lg hover:bg-pink transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs font-semibold text-pink uppercase tracking-wider mb-2">{t("screening.title")}</p>
        <h1 className="text-display-md font-serif text-ink">{t("screening.title")}</h1>
        <p className="text-ink/60 mt-2">{t("screening.subtitle")}</p>
      </div>

      {/* Prototype notice */}
      <div className="bg-cream border border-deep/20 rounded-xl p-5 mb-6 flex items-start gap-3">
        <AlertTriangle size={18} className="text-deep mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-deep mb-1">{t("screening.limitation")}</p>
          <p className="text-sm text-deep/80 leading-relaxed">{t("screening.limitation_text")}</p>
        </div>
      </div>

      {/* What it explores */}
      <div className="bg-white rounded-xl border border-border shadow-soft p-6 mb-6">
        <h2 className="font-serif font-semibold text-ink mb-3">{t("screening.what_it_is")}</h2>
        <p className="text-sm text-ink/70 leading-relaxed">{t("screening.what_it_is_desc")}</p>
      </div>

      {/* Consent */}
      <div className="bg-white rounded-xl border border-border shadow-soft p-6 mb-6">
        <div className="flex items-start gap-2 mb-4">
          <Info size={16} className="text-deep mt-0.5 shrink-0" />
          <h2 className="font-serif font-semibold text-ink">{t("screening.consent_heading")}</h2>
        </div>
        <p className="text-sm text-ink/70 leading-relaxed mb-4">{t("screening.consent_text")}</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-deep"
          />
          <span className="text-sm text-ink">
            I understand this is a prototype with no AI analysis, and that my images will not be sent to any external service.
          </span>
        </label>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className={!consented ? "opacity-50 pointer-events-none" : ""}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <UploadZone
            label={t("screening.upload_eyelid")}
            guidance={t("screening.guidance_eyelid")}
            state={eyelid}
            inputRef={eyelidRef}
            onChange={(e) => handleFile(e, setEyelid)}
            onRemove={() => setEyelid(emptyUpload())}
          />
          <UploadZone
            label={t("screening.upload_nail")}
            guidance={t("screening.guidance_nail")}
            state={nail}
            inputRef={nailRef}
            onChange={(e) => handleFile(e, setNail)}
            onRemove={() => setNail(emptyUpload())}
          />
        </div>

        <button
          type="submit"
          disabled={!consented || (!eyelid.file && !nail.file)}
          className="w-full py-3 bg-deep text-white text-sm font-medium rounded-lg hover:bg-pink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("screening.submit")}
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
  onChange,
  onRemove,
}: {
  label: string;
  guidance: string;
  state: UploadState;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-pink bg-blush hover:bg-rose transition-colors flex flex-col items-center justify-center gap-2 text-ink/50 hover:text-deep"
        >
          <Upload size={24} />
          <span className="text-xs">{t("forms.upload.drop_zone")}</span>
          <span className="text-xs text-deep font-medium">{t("forms.upload.browse")}</span>
        </button>
      )}

      {state.error && (
        <p className="text-xs text-red-600 mt-2">{state.error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
