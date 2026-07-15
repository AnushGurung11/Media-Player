// hooks/useAdminAnalytics.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useAdminAnalytics() {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [songAnalytics, setSongAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [userRes, songRes] = await Promise.all([
          api.get("/admin/analytics/users"),
          api.get("/admin/analytics/songs"),
        ]);
        setUserAnalytics(userRes.data);
        setSongAnalytics(songRes.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { userAnalytics, songAnalytics, loading, error };
}