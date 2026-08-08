// frontend/src/components/TrackUploadForm.jsx
import PropTypes from "prop-types";
import { useTrackUpload } from "../hooks/useTrackUpload";

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

const fileInputClass =
  "text-sm text-muted cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full " +
  "file:border-0 file:bg-btn-primary-bg file:text-btn-primary-fg " +
  "file:text-sm file:font-semibold hover:file:opacity-90 file:cursor-pointer file:transition-opacity";

function Step({ number, title, children }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 rounded-full bg-surface-2 text-muted text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <h3 className="text-lg">{title}</h3>
      </div>
      {children}
    </div>
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
    audioInputRef,
    coverInputRef,
    handleAudioChange,
    handleCoverChange,
    handleFieldChange,
    handleSubmit,
  } = useTrackUpload(onSuccess);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Step 1 — Audio file */}
      <Step number={1} title="Select Audio File">
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp4,audio/flac,audio/ogg"
          onChange={handleAudioChange}
          aria-label="Audio file"
          className={fileInputClass}
        />

        <div className="mt-3 space-y-1">
          {previewLoading && (
            <p role="status" className="text-sm text-info">⏳ Extracting metadata...</p>
          )}
          {previewError && (
            <p role="alert" className="text-sm text-warning">⚠ {previewError}</p>
          )}
          {metadataLoaded && (
            <p className="text-sm text-success">✅ Metadata extracted — review fields below.</p>
          )}
          {audioFile && (
            <p className="text-xs text-muted">
              {audioFile.name} — {(audioFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </Step>

      {/* Step 2 — Track info */}
      <Step number={2} title="Track Info">
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

        <div className="mt-4">
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
          <p className="text-xs text-muted mt-1.5">CC0, CC-BY, CC-BY-SA allow downloads.</p>
        </div>
      </Step>

      {/* Step 3 — Cover art */}
      <Step number={3} title="Cover Art (Optional)">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          aria-label="Cover art"
          className={fileInputClass}
        />
        {coverFile && (
          <p className="text-xs text-muted mt-2">
            {coverFile.name} — {(coverFile.size / 1024).toFixed(0)} KB
          </p>
        )}
      </Step>

      {/* Step 4 — Consent */}
      <Step number={4} title="Rights Confirmation">
        <label className="flex items-start gap-3 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-red-600 shrink-0"
          />
          <span className="text-muted">
            I confirm I own the rights to this content or it is freely licensed.
            I understand uploading copyrighted content without permission may result in removal.
          </span>
        </label>
      </Step>

      {uploadError && (
        <div role="alert" className="rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
          <strong>Error:</strong> {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div role="status" className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          {uploadSuccess}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={uploadLoading || !audioFile} className="btn-primary">
          {uploadLoading ? "Uploading..." : "Upload Track"}
        </button>
        {!audioFile && <span className="text-sm text-muted">Select an audio file first</span>}
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