import { useContext } from "react";
// hooks/useAuth.js
import { AuthContext } from "../context/auth-context";

export function useAuth() {
  return useContext(AuthContext);
}