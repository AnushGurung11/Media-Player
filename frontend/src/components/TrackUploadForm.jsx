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
  { name: "title", label: "Title *", required: true, placeholder: "Song title" },
  { name: "artist", label: "Artist *", required: true, placeholder: "Artist name" },
  { name: "album", label: "Album", required: false, placeholder: "Album (optional)" },
  { name: "genre", label: "Genre", required: false, placeholder: "Genre (optional)" },
];

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
    <form onSubmit={handleSubmit} noValidate>
      {/* Step 1 — Audio file */}
      <section>
        <h3>Step 1 — Select Audio File</h3>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp4,audio/flac,audio/ogg"
          onChange={handleAudioChange}
          aria-label="Audio file"
        />

        {previewLoading && (
          <p role="status" style={{ color: "blue" }}>
            ⏳ Extracting metadata...
          </p>
        )}
        {previewError && (
          <p role="alert" style={{ color: "orange" }}>
            ⚠ {previewError}
          </p>
        )}
        {metadataLoaded && (
          <p style={{ color: "green" }}>✅ Metadata extracted — review fields below.</p>
        )}
        {audioFile && (
          <p style={{ color: "gray", fontSize: "0.85em" }}>
            {audioFile.name} — {(audioFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </section>

      <hr />

      {/* Step 2 — Track info */}
      <section>
        <h3>Step 2 — Track Info</h3>
        <table cellPadding="8">
          <tbody>
            {TEXT_FIELDS.map(({ name, label, required, placeholder }) => (
              <tr key={name}>
                <td>
                  <label htmlFor={name}>
                    <strong>{label}</strong>
                  </label>
                </td>
                <td>
                  <input
                    id={name}
                    name={name}
                    type="text"
                    value={formData[name]}
                    onChange={handleFieldChange}
                    placeholder={placeholder}
                    required={required}
                    style={{ width: "300px" }}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <label htmlFor="license">
                  <strong>License *</strong>
                </label>
              </td>
              <td>
                <select
                  id="license"
                  name="license"
                  value={formData.license}
                  onChange={handleFieldChange}
                  required
                >
                  {LICENSE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <br />
                <small style={{ color: "gray" }}>CC0, CC-BY, CC-BY-SA allow downloads.</small>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <hr />

      {/* Step 3 — Cover art */}
      <section>
        <h3>Step 3 — Cover Art (Optional)</h3>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          aria-label="Cover art"
        />
        {coverFile && (
          <p style={{ color: "gray", fontSize: "0.85em" }}>
            {coverFile.name} — {(coverFile.size / 1024).toFixed(0)} KB
          </p>
        )}
      </section>

      <hr />

      {/* Step 4 — Consent */}
      <section>
        <h3>Step 4 — Rights Confirmation</h3>
        <label style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I confirm I own the rights to this content or it is freely licensed.
            I understand uploading copyrighted content without permission may result in removal.
          </span>
        </label>
      </section>

      <hr />

      {uploadError && (
        <div
          role="alert"
          style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "8px" }}
        >
          <strong>Error:</strong> {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div
          role="status"
          style={{ color: "green", border: "1px solid green", padding: "8px", marginBottom: "8px" }}
        >
          {uploadSuccess}
        </div>
      )}

      <button
        type="submit"
        disabled={uploadLoading || !audioFile}
        style={{ padding: "10px 24px", fontSize: "1em" }}
      >
        {uploadLoading ? "Uploading..." : "Upload Track"}
      </button>
      {!audioFile && (
        <span style={{ marginLeft: "12px", color: "gray", fontSize: "0.9em" }}>
          Select an audio file first
        </span>
      )}
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