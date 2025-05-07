import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    const stored = localStorage.getItem("chat-app");
    return stored ? JSON.parse(stored) : null;
  });

  // const [loading, setLoading] = useState(false);

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem("chat-app");
  };

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext easily
export const useAuth = () => useContext(AuthContext);
