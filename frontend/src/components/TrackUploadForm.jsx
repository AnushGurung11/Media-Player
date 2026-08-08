// frontend/src/components/TrackUploadForm.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTrackUpload } from "../hooks/useTrackUpload";
import {
  Music,
  FileAudio,
  Image,
  ShieldCheck,
  Upload,
  LoaderCircle,
  TriangleAlert,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const LICENSE_OPTIONS = [
  { value: "", label: "-- Select a license --" },
  { value: "all-rights-reserved", label: "All Rights Reserved" },
  { value: "CC0", label: "CC0 — Public Domain" },
  { value: "CC-BY", label: "CC-BY — Attribution" },
  { value: "CC-BY-SA", label: "CC-BY-SA — Attribution + ShareAlike" },
  { value: "CC-BY-NC", label: "CC-BY-NC — Attribution + NonCommercial" },
];

const TEXT_FIELDS = [
  { name: "title", label: "Title", required: true, placeholder: "Song title" },
  { name: "artist", label: "Artist", required: true, placeholder: "Artist name" },
  { name: "album", label: "Album", required: false, placeholder: "Album (optional)" },
  { name: "genre", label: "Genre", required: false, placeholder: "Genre (optional)" },
];

const STEPS = [
  { number: 1, label: "Audio" },
  { number: 2, label: "Details" },
  { number: 3, label: "License" },
  { number: 4, label: "Upload" },
];

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/* ── Stepper header ── */
function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => {
        const done = step.number < current;
        const active = step.number === current;
        return (
          <li key={step.number} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                done
                  ? "bg-btn-primary-bg text-btn-primary-fg"
                  : active
                    ? "bg-surface-2 text-text border border-text font-semibold"
                    : "bg-surface-2 text-muted border border-border"
              }`}
            >
              {done ? <CircleCheck size={14} strokeWidth={2.5} /> : step.number}
            </span>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                active ? "text-text" : "text-muted"
              }`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`flex-1 h-px ${done ? "bg-text" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Cover art preview with proper object-URL lifecycle ── */
function CoverPreview({ file }) {
  const [url] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <img
      src={url}
      alt="Cover preview"
      className="w-20 h-20 rounded-lg object-cover border border-border shrink-0"
    />
  );
}

function TrackUploadForm({ onSuccess }) {
  const {
    audioFile,
    coverFile,
    formData,
    consent,
    setConsent,
    previewLoading,
    uploadLoading,
    previewError,
    uploadError,
    uploadSuccess,
    metadataLoaded,
    uploadProgress,
    audioInputRef,
    coverInputRef,
    handleAudioChange,
    handleCoverChange,
    handleFieldChange,
    handleSubmit,
  } = useTrackUpload(onSuccess);

  const [step, setStep] = useState(1);

  const canProceedFrom = {
    1: !!audioFile,
    2: formData.title.trim() && formData.artist.trim(),
    3: !!formData.license && consent,
  };

  const removeCover = () => {
    coverInputRef.current.value = "";
    handleCoverChange({ target: { files: [] } });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stepper current={step} />

      {/* ── Step 1 · Audio file ── */}
      <div className={step === 1 ? "card" : "hidden"}>
        <h3 className="text-lg mb-1 flex items-center gap-2">
          <FileAudio size={18} strokeWidth={1.75} className="text-muted" />
          Add your audio
        </h3>
        <p className="text-sm text-muted mb-5">
          Pick the file first — we'll extract the metadata automatically in the
          next step.
        </p>

        <label className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border hover:border-text transition-colors p-10 cursor-pointer text-center">
          <Music size={36} strokeWidth={1.25} className="text-muted" />
          <span className="text-sm font-medium">
            Drop your audio here or <span className="underline">browse</span>
          </span>
          <span className="text-xs text-muted">
            MP3 · WAV · FLAC · OGG · M4A — up to 50 MB
          </span>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp4,audio/flac,audio/ogg"
            onChange={handleAudioChange}
            aria-label="Audio file"
            className="sr-only"
          />
        </label>

        {audioFile && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
            <FileAudio size={18} className="text-text shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{audioFile.name}</p>
              <p className="text-xs text-muted">{formatSize(audioFile.size)}</p>
            </div>
            <CircleCheck size={16} className="text-success shrink-0" />
          </div>
        )}

        <div className="mt-3 space-y-1">
          {previewLoading && (
            <p role="status" className="text-sm text-info flex items-center gap-1.5">
              <LoaderCircle size={14} className="animate-spin" />
              Extracting metadata...
            </p>
          )}
          {previewError && (
            <p role="alert" className="text-sm text-warning flex items-center gap-1.5">
              <TriangleAlert size={14} className="shrink-0" />
              {previewError}
            </p>
          )}
          {metadataLoaded && (
            <p className="text-sm text-success flex items-center gap-1.5">
              <CircleCheck size={14} />
              Metadata extracted — review fields in the next step.
            </p>
          )}
        </div>
      </div>

      {/* ── Step 2 · Details + cover ── */}
      <div className={step === 2 ? "card" : "hidden"}>
        <h3 className="text-lg mb-1 flex items-center gap-2">
          <Music size={18} strokeWidth={1.75} className="text-muted" />
          Describe your track
        </h3>
        <p className="text-sm text-muted mb-5">
          The fields were prefilled from the file's metadata — adjust as needed.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {TEXT_FIELDS.map(({ name, label, required, placeholder }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium mb-1.5">
                {label} {required && <span className="text-muted">*</span>}
              </label>
              <input
                id={name}
                name={name}
                type="text"
                value={formData[name]}
                onChange={handleFieldChange}
                placeholder={placeholder}
                required={required}
                className="input"
              />
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-5 pt-5">
          <label className="block text-sm font-medium mb-1.5">
            Cover art <span className="text-muted">(optional)</span>
          </label>
          {coverFile ? (
            <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <CoverPreview key={coverFile.name} file={coverFile} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{coverFile.name}</p>
                <p className="text-xs text-muted">{formatSize(coverFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeCover}
                className="btn-ghost !px-2 !py-1.5 text-xs flex items-center gap-1"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-text transition-colors p-8 cursor-pointer text-center">
              <Image size={28} strokeWidth={1.25} className="text-muted" />
              <span className="text-sm">
                Add a cover image <span className="text-muted">(JPEG · PNG · WEBP, max 5 MB)</span>
              </span>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverChange}
                aria-label="Cover art"
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {/* ── Step 3 · Licensing ── */}
      <div className={step === 3 ? "card" : "hidden"}>
        <h3 className="text-lg mb-1 flex items-center gap-2">
          <ShieldCheck size={18} strokeWidth={1.75} className="text-muted" />
          Licensing & rights
        </h3>
        <p className="text-sm text-muted mb-5">
          Choose how others may use your work.
        </p>

        <div className="max-w-md">
          <label htmlFor="license" className="block text-sm font-medium mb-1.5">
            License <span className="text-muted">*</span>
          </label>
          <select
            id="license"
            name="license"
            value={formData.license}
            onChange={handleFieldChange}
            required
            className="input"
          >
            {LICENSE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1.5">
            CC0, CC-BY, CC-BY-SA allow downloads.
          </p>
        </div>

        <div className="border-t border-border mt-5 pt-5">
          <label className="flex items-start gap-3 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-text shrink-0"
            />
            <span className="text-muted">
              I confirm I own the rights to this content or it is freely
              licensed. I understand uploading copyrighted content without
              permission may result in removal.
            </span>
          </label>
        </div>
      </div>

      {/* ── Step 4 · Review + upload ── */}
      <div className={step === 4 ? "card" : "hidden"}>
        <h3 className="text-lg mb-1 flex items-center gap-2">
          <Upload size={18} strokeWidth={1.75} className="text-muted" />
          Review & upload
        </h3>
        <p className="text-sm text-muted mb-5">
          One last look before it goes live.
        </p>

        <dl className="divide-y divide-border border border-border rounded-xl overflow-hidden text-sm mb-5">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted shrink-0">Track</dt>
            <dd className="font-medium truncate text-right">
              {formData.title} — {formData.artist}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted shrink-0">License</dt>
            <dd className="font-medium truncate text-right">
              {LICENSE_OPTIONS.find((o) => o.value === formData.license)?.label || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted shrink-0">File</dt>
            <dd className="font-medium truncate text-right">
              {audioFile ? `${audioFile.name} · ${formatSize(audioFile.size)}` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted shrink-0">Cover</dt>
            <dd className="font-medium truncate text-right">
              {coverFile ? coverFile.name : "None"}
            </dd>
          </div>
        </dl>

        {uploadError && (
          <div role="alert" className="rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger flex items-start gap-2 mb-4">
            <TriangleAlert size={15} className="shrink-0 mt-0.5" />
            <span><strong>Error:</strong> {uploadError}</span>
          </div>
        )}

        {uploadLoading && (
          <div className="w-full space-y-1.5 mb-4" role="status">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted flex items-center gap-1.5">
                {uploadProgress >= 100 ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin" />
                    Processing on server…
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Uploading…
                  </>
                )}
              </span>
              <span className="tabular-nums text-muted">{uploadProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 border border-border overflow-hidden">
              <div
                className={`h-full rounded-full bg-btn-primary-bg transition-[width] duration-300 ease-out ${
                  uploadProgress >= 100 ? "animate-pulse" : ""
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div role="status" className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success flex items-center gap-2 mb-4">
            <CircleCheck size={15} className="shrink-0" />
            {uploadSuccess}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between gap-3 mt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={uploadLoading}
            className="btn-outline flex items-center gap-1.5"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        ) : (
          <span className="text-xs text-muted">
            {audioFile ? "File selected" : "Select an audio file to continue"}
          </span>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceedFrom[step]}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={uploadLoading}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploadLoading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Track
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

TrackUploadForm.propTypes = {
  onSuccess: PropTypes.func,
};

TrackUploadForm.defaultProps = {
  onSuccess: undefined,
};

export default TrackUploadForm;
