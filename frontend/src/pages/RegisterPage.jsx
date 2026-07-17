// frontend/src/pages/RegisterPage.jsx
import { Link } from "react-router-dom";
import { useFormFields } from "../hooks/useFormFields";
import { useRegister } from "../hooks/useAuthForms";

function RegisterPage() {
  const [formData, handleChange] = useFormFields({ username: "", email: "", password: "" });
  const { error, loading, submitRegister } = useRegister();

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
            <div className="mb-4 rounded-md border border-blood bg-blood-dim/20 px-3 py-2 text-sm text-red-300">
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