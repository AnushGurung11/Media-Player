import { useState, useRef } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

const LICENSE_OPTIONS = [
  { value: "",                  label: "-- Select a license --" },
  { value: "all-rights-reserved", label: "All Rights Reserved" },
  { value: "CC0",               label: "CC0 — Public Domain" },
  { value: "CC-BY",             label: "CC-BY — Attribution" },
  { value: "CC-BY-SA",          label: "CC-BY-SA — Attribution + ShareAlike" },
  { value: "CC-BY-NC",          label: "CC-BY-NC — Attribution + NonCommercial" },
];

const EMPTY_FORM = {
  title:   "",
  artist:  "",
  album:   "",
  genre:   "",
  license: "",
};

function AdminUpload() {
  const [audioFile, setAudioFile]   = useState(null);
  const [coverFile, setCoverFile]   = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [consent, setConsent]       = useState(false);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadLoading, setUploadLoading]   = useState(false);
  const [previewError, setPreviewError]     = useState("");
  const [uploadError, setUploadError]       = useState("");
  const [uploadSuccess, setUploadSuccess]   = useState("");
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Step 1 — user picks an audio file
  // Immediately send it to /preview to extract metadata
  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    setPreviewError("");
    setMetadataLoaded(false);
    setFormData(EMPTY_FORM); // clear old data

    // Auto-extract metadata from the file
    setPreviewLoading(true);
    try {
      const data = new FormData();
      data.append("audio", file);

      const res = await api.post("/tracks/preview", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const meta = res.data.metadata;

      // Pre-fill form — user can edit anything before uploading
      setFormData({
        title:   meta.title  !== "Unknown Title"  ? meta.title  : "",
        artist:  meta.artist !== "Unknown Artist" ? meta.artist : "",
        album:   meta.album  !== "Unknown Album"  ? meta.album  : "",
        genre:   meta.genre  !== "Unknown"        ? meta.genre  : "",
        license: "",  // user must always choose license manually
      });

      setMetadataLoaded(true);
    } catch (err) {
      setPreviewError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Failed to extract metadata. You can still fill in the fields manually."
      );
      // Don't block upload — metadata extraction failing is not fatal
      setMetadataLoaded(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCoverChange = (e) => {
    setCoverFile(e.target.files[0] || null);
  };

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setUploadError("");
  };

  // Step 2 — user reviews fields, ticks consent, clicks Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    // Client-side validation
    if (!audioFile) {
      setUploadError("Please select an audio file.");
      return;
    }
    if (!formData.title.trim()) {
      setUploadError("Title is required.");
      return;
    }
    if (!formData.artist.trim()) {
      setUploadError("Artist is required.");
      return;
    }
    if (!formData.license) {
      setUploadError("Please select a license.");
      return;
    }
    if (!consent) {
      setUploadError("You must confirm you own the rights to this content.");
      return;
    }

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

      const res = await api.post("/tracks/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadSuccess(
        `✅ "${res.data.track.title}" by ${res.data.track.artist} uploaded successfully!`
      );

      // Reset the whole form for next upload
      setAudioFile(null);
      setCoverFile(null);
      setFormData(EMPTY_FORM);
      setConsent(false);
      setMetadataLoaded(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (coverInputRef.current) coverInputRef.current.value = "";

    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Upload failed. Check your connection and try again."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1>Upload New Track</h1>
      <p style={{ color: "gray" }}>
        Select an audio file — metadata will be extracted automatically.
        Review the fields, choose a license, confirm consent, then upload.
      </p>

      <hr />

      <form onSubmit={handleSubmit}>

        {/* ── Step 1: Audio file ── */}
        <section>
          <h3>Step 1 — Select Audio File</h3>

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp4,audio/flac,audio/ogg"
            onChange={handleAudioChange}
          />

          {previewLoading && (
            <p style={{ color: "blue" }}>⏳ Extracting metadata from file...</p>
          )}

          {previewError && (
            <div style={{ color: "orange", border: "1px solid orange", padding: "8px", marginTop: "8px" }}>
              <strong>Metadata warning:</strong> {previewError}
              <br />
              <small>You can still fill in the fields below manually.</small>
            </div>
          )}

          {metadataLoaded && (
            <p style={{ color: "green" }}>
              ✅ Metadata extracted — review and edit fields below before uploading.
            </p>
          )}

          {audioFile && (
            <p style={{ fontSize: "0.85em", color: "gray" }}>
              Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </section>

        <hr />

        {/* ── Step 2: Metadata fields ── */}
        <section>
          <h3>Step 2 — Review &amp; Edit Track Info</h3>

          <table cellPadding="8">
            <tbody>
              <tr>
                <td><label htmlFor="title"><strong>Title *</strong></label></td>
                <td>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleFieldChange}
                    placeholder="Song title"
                    style={{ width: "300px" }}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label htmlFor="artist"><strong>Artist *</strong></label></td>
                <td>
                  <input
                    id="artist"
                    name="artist"
                    type="text"
                    value={formData.artist}
                    onChange={handleFieldChange}
                    placeholder="Artist name"
                    style={{ width: "300px" }}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label htmlFor="album">Album</label></td>
                <td>
                  <input
                    id="album"
                    name="album"
                    type="text"
                    value={formData.album}
                    onChange={handleFieldChange}
                    placeholder="Album name (optional)"
                    style={{ width: "300px" }}
                  />
                </td>
              </tr>
              <tr>
                <td><label htmlFor="genre">Genre</label></td>
                <td>
                  <input
                    id="genre"
                    name="genre"
                    type="text"
                    value={formData.genre}
                    onChange={handleFieldChange}
                    placeholder="Genre (optional)"
                    style={{ width: "300px" }}
                  />
                </td>
              </tr>
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
                  <small style={{ color: "gray" }}>
                    CC0, CC-BY, CC-BY-SA allow downloads. Others do not.
                  </small>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <hr />

        {/* ── Step 3: Cover art ── */}
        <section>
          <h3>Step 3 — Cover Art (Optional)</h3>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
          />
          {coverFile && (
            <p style={{ fontSize: "0.85em", color: "gray" }}>
              Selected: {coverFile.name} ({(coverFile.size / 1024).toFixed(0)} KB)
            </p>
          )}
        </section>

        <hr />

        {/* ── Step 4: Consent ── */}
        <section>
          <h3>Step 4 — Rights Confirmation</h3>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: "3px" }}
            />
            <span>
              I confirm that I own the rights to this content, or it is licensed
              under a license that permits this upload. I understand that uploading
              copyrighted content without permission may result in removal.
            </span>
          </label>
        </section>

        <hr />

        {/* ── Error / Success messages ── */}
        {uploadError && (
          <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
            <strong>Upload Error:</strong> {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div style={{ color: "green", border: "1px solid green", padding: "8px", marginBottom: "12px" }}>
            {uploadSuccess}
          </div>
        )}

        {/* ── Submit ── */}
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
    </AdminLayout>
  );
}

export default AdminUpload;