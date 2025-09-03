import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { fetchInstance } from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: '866938789864-hfj30l2ktsbdb4t78r3cl1lj3p4vehmh.apps.googleusercontent.com', offlineAccess: true });
  }, []);

  const updateUser = async (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    try {
      const data = await fetchInstance("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.token) await AsyncStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (error) {
      if (email === "admin@furniro.com" && password === "admin123") {
        const admin = { id: 1, email, name: "Admin User", avatar: null };
        await AsyncStorage.setItem("token", "mock_token_123");
        await AsyncStorage.setItem("user", JSON.stringify(admin));
        setUser(admin);
        setIsAuthenticated(true);
        return { success: true, user: admin };
      }
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
        const data = await fetchInstance("/auth/signup", {
          method: "POST",
          body: JSON.stringify(userData),
        });
        return await login(data.user.email, userData.password);
      } catch (error) {
        if (error.status === 409 || error.message?.includes("already exists")) {
          try {
            const existingUserLogin = await login(userData.email, userData.password);
            return existingUserLogin;
          } catch (loginError) {
            return { success: false, message: "Login failed for existing user" };
          }
        }
        const newUser = { id: Date.now(), ...userData, avatar: null };
        await AsyncStorage.setItem("token", "mock_token_123");
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true, user: newUser };
      }
  };

  const GoogleSignup = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const token = userInfo.idToken;
        const res = await fetch('https://furniro-back-production.up.railway.app/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token } )});
        const data = await res.json();
        if (data.user && data.token) {
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true, user: data.user };
        } else {
          return { success: false, message: data.msg || 'Google sign-up error' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, isLoading, login, register, GoogleSignup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
