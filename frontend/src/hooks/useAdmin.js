// src/hooks/useAdmin.js
import { useAuth } from "@/context/AuthContext";

export default function useAdmin() {
  const { user } = useAuth();
  return user?.is_admin === true;
}
