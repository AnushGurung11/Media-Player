import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 text-center">
      <div>
        <p className="text-6xl font-display font-extrabold text-blood mb-2">404</p>
        <h1 className="text-xl mb-2">Page not found</h1>
        <p className="text-sm text-muted mb-6">The page you're looking for doesn't exist or was moved.</p>
        <Link to="/"><button className="btn-primary">Back to Home</button></Link>
      </div>
    </div>
  );
}

export default NotFoundPage;