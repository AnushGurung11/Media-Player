import AdminLayout from "./AdminLayout";
import TrackUploadForm from "../../components/TrackUploadForm";

function AdminUpload() {
  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl">Upload New Track</h1>
          <p className="text-sm text-muted">
            Select an audio file — metadata will be extracted automatically.
            Review the fields, choose a license, confirm consent, then upload.
          </p>
        </div>

        <TrackUploadForm />
      </div>
    </AdminLayout>
  );
}

export default AdminUpload;
