import { useState, useRef } from "react";
import api from "../services/api";

const LICENSE_OPTIONS = [
  { value: "",                    label: "-- Select a license --" },
  { value: "all-rights-reserved", label: "All Rights Reserved" },
  { value: "CC0",                 label: "CC0 — Public Domain" },
  { value: "CC-BY",               label: "CC-BY — Attribution" },
  { value: "CC-BY-SA",            label: "CC-BY-SA — Attribution + ShareAlike" },
  { value: "CC-BY-NC",            label: "CC-BY-NC — Attribution + NonCommercial" },
];

const EMPTY_FORM = { title: "", artist: "", album: "", genre: "", license: "" };

// Reusable upload form — used by both AdminUpload and UserUpload pages
function TrackUploadForm({ onSuccess }) {
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [consent, setConsent]     = useState(false);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadLoading, setUploadLoading]   = useState(false);
  const [previewError, setPreviewError]     = useState("");
  const [uploadError, setUploadError]       = useState("");
  const [uploadSuccess, setUploadSuccess]   = useState("");
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    setPreviewError("");
    setMetadataLoaded(false);
    setFormData(EMPTY_FORM);

    setPreviewLoading(true);
    try {
      const data = new FormData();
      data.append("audio", file);
      const res = await api.post("/tracks/preview", data);
      const meta = res.data.metadata;

      setFormData({
        title:   meta.title  !== "Unknown Title"  ? meta.title  : "",
        artist:  meta.artist !== "Unknown Artist" ? meta.artist : "",
        album:   meta.album  !== "Unknown Album"  ? meta.album  : "",
        genre:   meta.genre  !== "Unknown"        ? meta.genre  : "",
        license: "",
      });
      setMetadataLoaded(true);
    } catch (err) {
      setPreviewError(
        err.response?.data?.message ||
        "Could not extract metadata — fill in the fields manually."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setUploadError("");
  };

  const resetForm = () => {
    setAudioFile(null);
    setCoverFile(null);
    setFormData(EMPTY_FORM);
    setConsent(false);
    setMetadataLoaded(false);
    setUploadError("");
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!audioFile)              return setUploadError("Please select an audio file.");
    if (!formData.title.trim())  return setUploadError("Title is required.");
    if (!formData.artist.trim()) return setUploadError("Artist is required.");
    if (!formData.license)       return setUploadError("Please select a license.");
    if (!consent)                return setUploadError("You must confirm you own the rights.");

    setUploadLoading(true);
    try {
      const data = new FormData();
      data.append("audio",   audioFile);
      if (coverFile) data.append("cover", coverFile);
      data.append("title",   formData.title.trim());
      data.append("artist",  formData.artist.trim());
      data.append("album",   formData.album.trim());
      data.append("genre",   formData.genre.trim());
      data.append("license", formData.license);
      data.append("consent", "true");

      const res = await api.post("/tracks/upload", data);
      const msg = `✅ "${res.data.track.title}" by ${res.data.track.artist} uploaded successfully!`;
      setUploadSuccess(msg);
      resetForm();
      if (onSuccess) onSuccess(res.data.track); // notify parent if needed
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Upload failed. Try again."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Step 1 — Audio file */}
      <section>
        <h3>Step 1 — Select Audio File</h3>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp4,audio/flac,audio/ogg"
          onChange={handleAudioChange}
        />
        {previewLoading && <p style={{ color: "blue" }}>⏳ Extracting metadata...</p>}
        {previewError && (
          <p style={{ color: "orange" }}>⚠ {previewError}</p>
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
            {[
              { name: "title",  label: "Title *",  required: true,  placeholder: "Song title" },
              { name: "artist", label: "Artist *", required: true,  placeholder: "Artist name" },
              { name: "album",  label: "Album",    required: false, placeholder: "Album (optional)" },
              { name: "genre",  label: "Genre",    required: false, placeholder: "Genre (optional)" },
            ].map(({ name, label, required, placeholder }) => (
              <tr key={name}>
                <td><label htmlFor={name}><strong>{label}</strong></label></td>
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
              <td><label htmlFor="license"><strong>License *</strong></label></td>
              <td>
                <select
                  id="license"
                  name="license"
                  value={formData.license}
                  onChange={handleFieldChange}
                  required
                >
                  {LICENSE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
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
          onChange={(e) => setCoverFile(e.target.files[0] || null)}
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

      {/* Messages */}
      {uploadError && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "8px" }}>
          <strong>Error:</strong> {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div style={{ color: "green", border: "1px solid green", padding: "8px", marginBottom: "8px" }}>
          {uploadSuccess}
        </div>
      )}

      {/* Submit */}
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

export default TrackUploadForm;