import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useFormFields } from "../hooks/useFormFields";
import { useRegister, useGoogleAuth } from "../hooks/useAuthForms";

function RegisterPage() {
  const [formData, handleChange] = useFormFields({ username: "", email: "", password: "" });
  const { error, loading, submitRegister } = useRegister();
  const { error: googleError, submitGoogleLogin } = useGoogleAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    submitRegister(formData);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-2xl font-display font-bold tracking-tight text-text">
            VIBE<span className="text-blood">.</span>
          </span>
          <p className="text-sm text-muted mt-1">Create an account to get started.</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-danger">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1.5">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className="input"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password <span className="text-muted font-normal">(min 6 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account..." : "Register"}
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
          Already have an account?{" "}
          <Link to="/login" className="text-blood hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;