// hooks/useAuthForms.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLogin = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === "admin" ? "/admin/overview" : "/");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, submitLogin };
}

export function useRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRegister = async (formData) => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", formData);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, submitRegister };
}