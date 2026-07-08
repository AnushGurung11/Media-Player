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
    <div>
      <h1>Login</h1>

      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
        <br />
        <div>
          <label>Password</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;