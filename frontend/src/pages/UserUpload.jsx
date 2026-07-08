import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import TrackUploadForm from "../components/TrackUploadForm";

const REDIRECT_DELAY_MS = 2000;

function UserUpload() {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

  // Clear any pending redirect if the component unmounts early
  // (e.g. user clicks "Back to Player" during the 2s success window)
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleUploadSuccess = () => {
    redirectTimeoutRef.current = setTimeout(() => {
      navigate("/");
    }, REDIRECT_DELAY_MS);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "700px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Upload a Track</h1>
        <Link to="/">← Back to Player</Link>
      </div>

      <p style={{ color: "gray" }}>
        Share your original or freely licensed music with the community.
      </p>

      <div
        role="note"
        style={{ border: "1px solid orange", padding: "10px", marginBottom: "16px" }}
      >
        <strong>⚠ Important:</strong> Only upload content you own or have rights to share.
      </div>

      <TrackUploadForm onSuccess={handleUploadSuccess} />
    </div>
  );
}

export default UserUpload;