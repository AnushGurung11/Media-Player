import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  const isAdmin = user?.role === "admin";

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({});
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}