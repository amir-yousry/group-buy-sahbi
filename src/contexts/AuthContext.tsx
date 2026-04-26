import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  getUsers,
  initMockStore,
  setCurrentUserId,
  updateUser as updateUserStore,
} from "@/lib/mock-store";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUser: (patch: Partial<User>) => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initMockStore();
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  const login = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setUser(getCurrentUser());
  }, []);

  const logout = useCallback(() => {
    setCurrentUserId(null);
    setUser(null);
  }, []);

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setUser(getCurrentUser());
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    if (!user) return;
    const next = updateUserStore(user.id, patch);
    setUser(next);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, switchUser, updateUser, refresh }),
    [user, loading, login, logout, switchUser, updateUser, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useAllUsers() {
  return getUsers();
}
