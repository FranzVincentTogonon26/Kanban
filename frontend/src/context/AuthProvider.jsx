import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./createContext";
import { authApi, clearToken, getToken, setToken, userApi } from "../lib/api";
import { connecSocket, disconnectSocket } from "../lib/socket";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearToken();
    disconnectSocket();
    setUser(null);
    setUsers([]);
  }, []);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      clearAuth();
      return null;
    }

    try {
      const [currentUser, allUsers] = await Promise.all([
        authApi.me(),
        userApi.list(),
      ]);

      setUser(currentUser);
      setUsers(allUsers);
      connecSocket();

      return currentUser;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      await loadUser();

      if (!ignore) {
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [loadUser]);

  const handleAuth = useCallback(({ user, token }) => {
    setToken(token);
    setUser(user);
    connecSocket();

    return user;
  }, []);

  const login = useCallback(
    async (credentials) => handleAuth(await authApi.login(credentials)),
    [handleAuth],
  );

  const register = useCallback(
    async (data) => handleAuth(await authApi.register(data)),
    [handleAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
    setLoading(false);
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        login,
        register,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
