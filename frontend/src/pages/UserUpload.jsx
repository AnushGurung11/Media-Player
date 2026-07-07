import { useNavigate, Link } from "react-router-dom";
import TrackUploadForm from "../components/TrackUploadForm";

function UserUpload() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "24px", maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h1>Upload a Track</h1>
                <Link to="/">← Back to Player</Link>
            </div>
            <p style={{ color: "gray" }}>
                Share your original or freely licensed music with the community.
            </p>
            <div style={{ border: "1px solid orange", padding: "10px", marginBottom: "16px" }}>
                <strong>⚠ Important:</strong> Only upload content you own or have rights to share.
            </div>
            <TrackUploadForm onSuccess={() => setTimeout(() => navigate("/"), 2000)} />
        </div>
    );
}

export default UserUpload;