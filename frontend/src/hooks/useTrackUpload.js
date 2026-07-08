// hooks/useTrackUpload.js
import { useState, useRef } from "react";
import api from "../services/api";

const EMPTY_FORM = { title: "", artist: "", album: "", genre: "", license: "" };

export function useTrackUpload(onSuccess) {
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
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
        title: meta.title !== "Unknown Title" ? meta.title : "",
        artist: meta.artist !== "Unknown Artist" ? meta.artist : "",
        album: meta.album !== "Unknown Album" ? meta.album : "",
        genre: meta.genre !== "Unknown" ? meta.genre : "",
        license: "",
      });
      setMetadataLoaded(true);
    } catch (err) {
      setPreviewError(err.response?.data?.message || "Could not extract metadata — fill in manually.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setUploadError("");
  };

  const resetForm = () => {
    setAudioFile(null); setCoverFile(null); setFormData(EMPTY_FORM);
    setConsent(false); setMetadataLoaded(false); setUploadError("");
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(""); setUploadSuccess("");
    if (!audioFile) return setUploadError("Please select an audio file.");
    if (!formData.title.trim()) return setUploadError("Title is required.");
    if (!formData.artist.trim()) return setUploadError("Artist is required.");
    if (!formData.license) return setUploadError("Please select a license.");
    if (!consent) return setUploadError("You must confirm you own the rights.");

    setUploadLoading(true);
    try {
      const data = new FormData();
      data.append("audio", audioFile);
      if (coverFile) data.append("cover", coverFile);
      Object.entries(formData).forEach(([k, v]) => data.append(k, v.trim ? v.trim() : v));
      data.append("consent", "true");
      const res = await api.post("/tracks/upload", data);
      setUploadSuccess(`✅ "${res.data.track.title}" by ${res.data.track.artist} uploaded successfully!`);
      resetForm();
      if (onSuccess) onSuccess(res.data.track);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.response?.data?.error || "Upload failed. Try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  return {
    audioFile, coverFile, formData, consent, setConsent,
    previewLoading, uploadLoading, previewError, uploadError, uploadSuccess, metadataLoaded,
    audioInputRef, coverInputRef,
    handleAudioChange, handleFieldChange, setCoverFile, handleSubmit,
  };
}