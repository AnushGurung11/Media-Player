// hooks/useAdminUsers.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleDelete = async (targetUser) => {
    if (!window.confirm(`Delete user "${targetUser.username}"? This cannot be undone.`)) return;
    setDeletingId(targetUser.id);
    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return { users, loading, error, deletingId, handleDelete };
}