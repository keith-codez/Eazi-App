import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // adjust path as needed

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("auth/me/");
      setUser(res.data);
      setRole(res.data.role);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error fetching user:", err);
      }
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      // Step 1: Login and get cookie
      await axiosInstance.post("login/", { username, password }, {
        withCredentials: true,
      });

      // Step 2: Fetch user profile
      const res = await axiosInstance.get("auth/me/");
      const userData = res.data;

      setUser(userData);
      setRole(userData.role);

      return userData; // ⬅️ return for redirect logic
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout/");
      setUser(null);
      setRole(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
