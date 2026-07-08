import AdminLayout from "./AdminLayout";
import TrackUploadForm from "../../components/TrackUploadForm";

function AdminUpload() {
  return (
    <AdminLayout>
      <h1>Upload New Track</h1>
      <p style={{ color: "gray" }}>
        Select an audio file — metadata will be extracted automatically.
        Review the fields, choose a license, confirm consent, then upload.
      </p>

      <hr />

      <TrackUploadForm
        onSuccess={() => {
          // e.g. navigate to /admin/tracks, or leave the success message showing
        }}
      />
    </AdminLayout>
  );
}

export default AdminUpload;