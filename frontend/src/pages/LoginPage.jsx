import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const navigate  = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);

      // Store token AND user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));

      // Redirect based on role ← industry standard approach
      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center
                    justify-center px-4 py-12 relative overflow-hidden">

      {/* Signature glow */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2
                      w-[600px] h-[600px] rounded-full pointer-events-none
                      bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.28)_0%,rgba(124,58,237,0.06)_50%,transparent_70%)]
                      animate-pulse" />

      <div className="card relative z-10 w-full max-w-md px-8 py-10
                      shadow-[0_0_60px_rgba(124,58,237,0.15)]">

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl text-violet-400">♪</span>
          <span className="font-['Syne'] text-2xl font-extrabold text-[#F0EEFF] tracking-tight">
            Vibe
          </span>
        </div>

        <h1 className="font-['Syne'] text-2xl font-bold text-center
                       text-[#F0EEFF] tracking-tight mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-[#6B6B8A] text-center mb-7">
          Log in to continue listening
        </p>

        {error && (
          <div className="error-banner mb-5" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email" name="email" type="email"
              className="input-field" placeholder="you@example.com"
              value={formData.email} onChange={handleChange}
              required autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password" name="password" type="password"
              className="input-field" placeholder="••••••••"
              value={formData.password} onChange={handleChange}
              required autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 mt-1 text-sm"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-[#6B6B8A] text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register"
                className="text-violet-400 font-semibold hover:text-white
                           transition-colors no-underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;