import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./createContext";
import { authApi, clearToken, getToken, setToken } from "../lib/api";
import { connecSocket, disconnectSocket } from "../lib/socket";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!loading) return;

    authApi
      .me()
      .then((user) => {
        setUser(user);
        connecSocket();
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [loading]);

  const handleAuth = useCallback(({ user, token }) => {
    setToken(token);
    setUser(user);
    connecSocket();
    return user;
  }, []);

  const login = useCallback(
    async (data) => handleAuth(await authApi.login(data)),
    [handleAuth],
  );

  const register = useCallback(
    async (data) => {
      handleAuth(await authApi.register(data));
    },
    [handleAuth],
  );
  const logout = useCallback(() => {
    clearToken();
    disconnectSocket();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
