// frontend/src/pages/LoginPage.jsx
import { Link } from "react-router-dom";
import { useFormFields } from "../hooks/useFormFields";
import { useLogin } from "../hooks/useAuthForms";

function LoginPage() {
  const [formData, handleChange] = useFormFields({ email: "", password: "" });
  const { error, loading, submitLogin } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin(formData);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-2xl font-display font-bold tracking-tight text-text">
            VIBE<span className="text-blood">.</span>
          </span>
          <p className="text-sm text-muted mt-1">Log in to keep listening.</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-red-300">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blood hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;