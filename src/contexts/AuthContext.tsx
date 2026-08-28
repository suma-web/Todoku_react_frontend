import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "../api/user";

type AuthState = { user: CurrentUser | null; loading: boolean; refresh: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => { try { setUser(await getCurrentUser()); } catch { setUser(null); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, []);
  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error("AuthProvider is missing"); return value; };
