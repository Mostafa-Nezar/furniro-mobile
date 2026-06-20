import { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { fetchInstance } from "./api";

const AuthContext = createContext();
const initialState = { user: null, isAuthenticated: false, isLoading: true };

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS": return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case "LOGOUT": return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case "UPDATE_USER": return { ...state, user: action.payload };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: '866938789864-hfj30l2ktsbdb4t78r3cl1lj3p4vehmh.apps.googleusercontent.com', offlineAccess: true });
    loadUser();
  }, []);

  const loadUser = async () => {
    await AsyncStorage.removeItem("token");
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      dispatch({ type: "LOGIN_SUCCESS", payload: JSON.parse(storedUser) });
    }
    const loggedIn = await checkTokenAndAutoLogin();
    if (!loggedIn) {
      await AsyncStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }
  };

  const GoogleSignup = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const token = userInfo.idToken;
      const data = await fetchInstance("/auth/google", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
        return { success: true, user: data.user };
      }
      return { success: false, message: data.msg || "Google sign-up error" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };
  const register = async (userData) => {
    try {
      const data = await fetchInstance("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      const newUser = data.user || userData;
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      dispatch({ type: "REGISTER_SUCCESS", payload: newUser });
      return { success: true };
    } catch (error) {
      if (error.status === 409 || error.message?.includes("already exists")) {
        try {
          const loginResult = await login(userData.email, userData.password);
          if (loginResult.success) {
            return { success: true, message: "login" };
          } else {
            return { success: false, message: loginResult.message };
          }
        } catch (loginError) {
          return { success: false, message: loginError.message };
        }
      }
      return { success: false, message: error.message };
    }
  };
  const updateUser = async (updatedUserData) => {
    const newUser = { ...state.user, ...updatedUserData };
    dispatch({ type: "UPDATE_USER", payload: newUser });
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
  };
  const login = async (email, password) => {
    const data = await fetchInstance("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
    return { success: true, user: data.user };
  };
  const checkTokenAndAutoLogin = async () => {
    try {
      const data = await fetchInstance("/auth/check-token", { method: "GET" });
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, GoogleSignup, updateUser, checkTokenAndAutoLogin, dispatch }} >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
