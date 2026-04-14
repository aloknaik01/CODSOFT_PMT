import { createContext, useContext, useEffect, useState } from "react";
import {
  apiGetCurrentUser,
  apiLogin,
  apiLogout,
  apiRegister,
} from "../services/api";

const AuthContext = createContext(null);

// Normalize user: map DB snake_case to frontend camelCase
function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    avatar: u.avatar ?? u.avatar_url ?? null,
    role: u.role ?? "member",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    apiGetCurrentUser()
      .then((res) => {
        // /auth/me returns user object directly at res.data
        const u = normalizeUser(res.data);
        setUser({ ...u, token: "" });
      })
      .catch(() => {
        // 401 or network error — not logged in
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    // Backend returns { data: { user: {...} } } for auth endpoints
    const userData = normalizeUser(res.data?.user ?? res.data);
    setUser({ ...userData, token: "" });
  };

  const register = async (payload) => {
    const res = await apiRegister(payload);
    // Backend returns { data: { user: {...} } } for auth endpoints
    const userData = normalizeUser(res.data?.user ?? res.data);
    setUser({ ...userData, token: "" });
  };

  const logout = () => {
    apiLogout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
