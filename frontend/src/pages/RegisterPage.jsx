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
    <div>
      <h1>Register</h1>

      {error && (
        <div style={{ color: "red", border: "1px solid red", padding: "8px", marginBottom: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label><br />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>
        <br />
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
          <label>Password (min 6 characters)</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;