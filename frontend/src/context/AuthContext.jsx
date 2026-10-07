import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("pccoe_token"));
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("/default_avatar.png");

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          const savedAvatar = localStorage.getItem(`peer_ai_avatar_${profile.email}`);
          if (savedAvatar) {
            setAvatar(savedAvatar);
          } else {
            setAvatar("/default_avatar.png");
          }
        } catch (err) {
          console.error("Session restoration error:", err);
          if (err?.status === 401 || err?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const updateAvatar = (dataUrl) => {
    if (user?.email) {
      try {
        localStorage.setItem(`peer_ai_avatar_${user.email}`, dataUrl);
      } catch (err) {
        console.warn("Storage quota exceeded for avatar", err);
      }
    }
    setAvatar(dataUrl);
  };

  const resetAvatar = () => {
    if (user?.email) {
      localStorage.removeItem(`peer_ai_avatar_${user.email}`);
    }
    setAvatar("/default_avatar.png");
  };

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("pccoe_token", data.access_token);
    setToken(data.access_token);
    let profile = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      prn: data.prn,
    };
    try {
      const fullProfile = await authApi.getMe();
      profile = fullProfile;
    } catch (e) {
      // fallback to basic profile
    }
    setUser(profile);
    const savedAvatar = localStorage.getItem(`peer_ai_avatar_${data.email}`);
    setAvatar(savedAvatar || "/default_avatar.png");
    return profile;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    localStorage.setItem("pccoe_token", data.access_token);
    setToken(data.access_token);
    let profile = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      prn: data.prn,
    };
    try {
      const fullProfile = await authApi.getMe();
      profile = fullProfile;
    } catch (e) {
      // fallback
    }
    setUser(profile);
    setAvatar("/default_avatar.png");
    return profile;
  };

  const googleLogin = async (payload) => {
    const data = await authApi.googleAuth(payload);
    localStorage.setItem("pccoe_token", data.access_token);
    setToken(data.access_token);
    let profile = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      prn: data.prn,
    };
    try {
      const fullProfile = await authApi.getMe();
      profile = fullProfile;
    } catch (e) {
      // fallback
    }
    setUser(profile);
    const savedAvatar = localStorage.getItem(`peer_ai_avatar_${data.email}`);
    setAvatar(savedAvatar || "/default_avatar.png");
    return profile;
  };

  const logout = () => {
    localStorage.removeItem("pccoe_token");
    setToken(null);
    setUser(null);
    setAvatar("/default_avatar.png");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        avatar,
        updateAvatar,
        resetAvatar,
        login,
        register,
        googleLogin,
        logout,
        isAuthenticated: !!user,
        isTeacher: user?.role === "teacher",
        isStudent: user?.role === "student",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
