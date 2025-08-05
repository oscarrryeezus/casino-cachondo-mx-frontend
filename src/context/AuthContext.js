import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

useEffect(() => {
  const checkSession = async () => {
    const token = localStorage.getItem("token");
    if (!token || isAuthenticated) {
      setCheckingSession(false);
      return;
    }

    try {
      api.interceptors.request.use((config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      const { data } = await api.get("/auth/validation");
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error de autenticación:", err);
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  };

  checkSession();
}, [isAuthenticated]);


  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };
  
   const updateBalance = (newBalance) => {
    setUser(prev => ({ ...prev, fondos: newBalance }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        checkingSession,
        updateBalance,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);