import { useState, useRef, useCallback, useEffect } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  title: "",
  artist: "",
  album: "",
  genre: "",
  license: "",
};

const MAX_AUDIO_SIZE_MB = 50;
const MAX_COVER_SIZE_MB = 5;

/**
 * Encapsulates all state and side effects for uploading a track:
 * audio selection + metadata preview, form fields, cover art,
 * consent, and the final submit.
 *
 * @param {(track: object) => void} [onSuccess] called with the created track after a successful upload
 */
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

  // Guards against a stale preview response overwriting a newer one
  // if the user swaps files quickly (classic race condition).
  const previewRequestId = useRef(0);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const validateAudioFile = (file) => {
    if (file.size > MAX_AUDIO_SIZE_MB * 1024 * 1024) {
      return `Audio file must be under ${MAX_AUDIO_SIZE_MB}MB.`;
    }
    return null;
  };

  const validateCoverFile = (file) => {
    if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
      return `Cover image must be under ${MAX_COVER_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleAudioChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateAudioFile(file);
    if (validationError) {
      setPreviewError(validationError);
      e.target.value = "";
      return;
    }

    setAudioFile(file);
    setPreviewError("");
    setMetadataLoaded(false);
    setFormData(EMPTY_FORM);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestId = ++previewRequestId.current;

    setPreviewLoading(true);
    try {
      const data = new FormData();
      data.append("audio", file);

      const res = await api.post("/tracks/preview", data, {
        signal: controller.signal,
      });

      // A newer request has since started — ignore this stale response.
      if (requestId !== previewRequestId.current) return;

      const meta = res.data.metadata ?? {};
      setFormData({
        title: meta.title && meta.title !== "Unknown Title" ? meta.title : "",
        artist: meta.artist && meta.artist !== "Unknown Artist" ? meta.artist : "",
        album: meta.album && meta.album !== "Unknown Album" ? meta.album : "",
        genre: meta.genre && meta.genre !== "Unknown" ? meta.genre : "",
        license: "",
      });
      setMetadataLoaded(true);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      if (requestId !== previewRequestId.current) return;

      setPreviewError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to extract metadata. You can still fill in the fields manually."
      );
      setMetadataLoaded(false);
    } finally {
      if (requestId === previewRequestId.current) setPreviewLoading(false);
    }
  }, []);

  const handleCoverChange = useCallback((e) => {
    const file = e.target.files[0] || null;
    if (file) {
      const validationError = validateCoverFile(file);
      if (validationError) {
        setUploadError(validationError);
        e.target.value = "";
        return;
      }
    }
    setCoverFile(file);
  }, []);

  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setUploadError("");
  }, []);

  const resetForm = useCallback(() => {
    setAudioFile(null);
    setCoverFile(null);
    setFormData(EMPTY_FORM);
    setConsent(false);
    setMetadataLoaded(false);
    setUploadError("");
    setPreviewError("");
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  }, []);

  const validate = () => {
    if (!audioFile) return "Please select an audio file.";
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.artist.trim()) return "Artist is required.";
    if (!formData.license) return "Please select a license.";
    if (!consent) return "You must confirm you own the rights to this content.";
    return null;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setUploadError("");
      setUploadSuccess("");

      const validationError = validate();
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setUploadLoading(true);
      try {
        const data = new FormData();
        data.append("audio", audioFile);
        if (coverFile) data.append("cover", coverFile);
        data.append("title", formData.title.trim());
        data.append("artist", formData.artist.trim());
        data.append("album", formData.album.trim());
        data.append("genre", formData.genre.trim());
        data.append("license", formData.license);
        data.append("consent", "true");

        const res = await api.post("/tracks/upload", data);
        const track = res.data.track;

        setUploadSuccess(`✅ "${track.title}" by ${track.artist} uploaded successfully!`);
        resetForm();
        onSuccess?.(track);
      } catch (err) {
        setUploadError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Upload failed. Check your connection and try again."
        );
      } finally {
        setUploadLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioFile, coverFile, formData, consent, onSuccess]
  );

  return {
    // state
    audioFile,
    coverFile,
    formData,
    consent,
    previewLoading,
    uploadLoading,
    previewError,
    uploadError,
    uploadSuccess,
    metadataLoaded,
    // refs
    audioInputRef,
    coverInputRef,
    // intent-named handlers only — no raw setters exposed except consent,
    // which has no side effects worth wrapping
    setConsent,
    handleAudioChange,
    handleCoverChange,
    handleFieldChange,
    handleSubmit,
  };
}