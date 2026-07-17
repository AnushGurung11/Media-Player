// frontend/src/pages/UserUpload.jsx
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import TrackUploadForm from "../components/TrackUploadForm";

const REDIRECT_DELAY_MS = 2000;

function UserUpload() {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

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
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl">Upload a Track</h1>
        <Link to="/"><button className="btn-ghost">← Back to Player</button></Link>
      </div>

      <p className="text-sm text-muted mb-4">
        Share your original or freely licensed music with the community.
      </p>

      <div role="note" className="rounded-md border border-amber-600 bg-amber-950/20 px-3 py-2 mb-6 text-sm text-amber-300">
        <strong>⚠ Important:</strong> Only upload content you own or have rights to share.
      </div>

      <TrackUploadForm onSuccess={handleUploadSuccess} />
    </div>
  );
}

export default UserUpload;