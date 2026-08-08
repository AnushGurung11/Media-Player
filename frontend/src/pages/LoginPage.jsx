import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useFormFields } from "../hooks/useFormFields";
import { useLogin, useGoogleAuth } from "../hooks/useAuthForms";
import Brand from "../components/Brand";

function LoginPage() {
  const [formData, handleChange] = useFormFields({ email: "", password: "" });
  const { error, loading, submitLogin } = useLogin();
  const { error: googleError, submitGoogleLogin } = useGoogleAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin(formData);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Brand className="text-3xl" />
          <p className="text-sm text-muted mt-2">Log in to keep listening.</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
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

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {googleError && (
            <div className="mb-3 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
              {googleError}
            </div>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={submitGoogleLogin}
              onError={() => console.error("Google sign-in failed")}
              theme="filled_black"
              shape="pill"
              width="300"
            />
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
