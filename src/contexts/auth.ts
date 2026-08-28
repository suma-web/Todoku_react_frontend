import { createContext, useContext } from "react";
import type { CurrentUser } from "../api/user";

export type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is missing");
  return value;
};
