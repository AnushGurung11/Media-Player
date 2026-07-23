import { Link } from "react-router-dom";

function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 text-center">
      <div>
        <p className="text-6xl font-display font-extrabold text-blood mb-2">403</p>
        <h1 className="text-xl mb-2">Restricted</h1>
        <p className="text-sm text-muted mb-6">You don't have permission to view this page.</p>
        <Link to="/"><button className="btn-primary">Back to Home</button></Link>
      </div>
    </div>
  );
}

export default ForbiddenPage;