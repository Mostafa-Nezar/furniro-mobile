import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, darkColors } from "../constants/theme.jsx";
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const AppContext = createContext();
const API_BASE_URL = "https://furniro-back-production.up.railway.app/api";
const fetchInstance = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem("token");
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.msg || "Unknown error");
    error.response = response;
    error.data = data;
    throw error;
  }
  return data;
};

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [theme, setTheme] = useState(colors);
  const [orders,setorders] = useState([]);
  useEffect(() => {
    loadStoredData();
    GoogleSignin.configure({webClientId:'866938789864-hfj30l2ktsbdb4t78r3cl1lj3p4vehmh.apps.googleusercontent.com',offlineAccess:true});
  }, []);
  useEffect(() => {
    saveDataToStorage();
  }, [isDarkMode, cart, favorites, user, isAuthenticated]);
  useEffect(() => {
  if (user && user.id) {
    fetchOrders(user.id);
  }
}, [user]);
  const fetchNotifications = async (setNotifications) => {
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (!user?.id) return;
    try {
      const data = await fetchInstance("/notifications");
      setNotifications((data.notifications || []).filter(n => n.userId === user.id));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };
  const fetchOrders = async (userId) => {
      const response = await fetch(`https://furniro-back-production.up.railway.app/api/orders/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setorders(data);
      return data;
  };
  const loadStoredData = async () => {
    try {
      const appDataRaw = await AsyncStorage.getItem("appData");
      const userRaw = await AsyncStorage.getItem("user");
      const appData = appDataRaw ? JSON.parse(appDataRaw) : {};
      const storedUser = userRaw ? JSON.parse(userRaw) : null;

      setIsDarkMode(appData.isDarkMode || false);
      setFavorites(appData.favorites || []);
      setIsAuthenticated(appData.isAuthenticated || false);
      setUser(storedUser);
      setTheme(appData.isDarkMode ? darkColors : colors);
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };
  const saveDataToStorage = async () => {
    try {
      const appData = {
        isDarkMode,
        favorites,
        isAuthenticated,
      };
      await AsyncStorage.setItem("appData", JSON.stringify(appData));
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    setTheme(newTheme ? darkColors : colors);
  };
  const addToCart = async (product) => {
    if (!user?.id) return;
    try {
      const cart = user.cart || [];
      const existingItem = cart.find((item) => item.id === product.id);
      let updatedCart;
      if (existingItem) {
        updatedCart = cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [
          ...cart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
          },
        ];
      }

      const data = await fetchInstance(`/auth/user/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cart: updatedCart }),
      });

      const updatedUser = { ...user, cart: updatedCart };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ Product added to cart:", product.name);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
    }
  };
  const removeFromCart = async (productId) => {
    if (!user?.id) return;

    try {
      const cart = user.cart || [];
      const updatedCart = cart.filter((item) => item.id !== productId);

      const data = await fetchInstance(`/auth/user/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cart: updatedCart }),
      });

      const updatedUser = { ...user, cart: updatedCart };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("🗑️ Product removed from cart:", productId);
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
    }
  };
  const clearCartAndUpdateOrsers = async () => {
    console.log("hi");
    if (!user?.id) return;
    await fetchInstance("/orders", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        products: user.cart,
        date: new Date().toISOString(),
        total: user.cart.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0),
      }),
    });
    await fetchInstance(`/auth/user/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ cart: [] }),
    });
    const updatedUser = { ...user, cart: [] };
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  };
  const toggleFavorite = (id) => {favorites.includes(id)?setFavorites(favorites.filter((fav) => fav !== id)):setFavorites([...favorites, id]);
  };
  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
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
      const res = await fetch(
        'https://furniro-back-production.up.railway.app/api/auth/google',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }
      );
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
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      setCart([]);
      setFavorites([]);
      return true;
    } catch (e) {
      return false;
    }
  };
  const updateCartQuantity = async (productId, newQuantity) => {
    if (!user?.id) return;
    try {
      const cart = user.cart || [];
      let updatedCart;
      if (newQuantity < 1) {
        updatedCart = cart.filter((item) => item.id !== productId);
        console.log("🗑️ Product removed from cart:", productId);
      } else {
        updatedCart = cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        console.log("🔁 Quantity updated for product:", productId, "to", newQuantity);
      }

      const data = await fetchInstance(`/auth/user/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cart: updatedCart }),
      });

      const updatedUser = { ...user, cart: updatedCart };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("❌ Error updating quantity:", err);
    }
  };
  const getProducts = async () => {
    try {
      const data = await fetchInstance("/products/db");
      setProducts(data);
      await AsyncStorage.setItem("products", JSON.stringify(data));
      return data;
    } catch {
      const cached = await AsyncStorage.getItem("products");
      if (cached) {
        const parsed = JSON.parse(cached);
        setProducts(parsed);
        return parsed;
      }
      return [];
    }
  };
  const searchProducts = async (q) => {
    try {
      const data = await fetchInstance(`/products/db/search?q=${q}`);
      return data;
    } catch {
      const cached = await AsyncStorage.getItem("products");
      if (cached) {
        const list = JSON.parse(cached);
        return list.filter(
          (p) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.des.toLowerCase().includes(q.toLowerCase())
        );
      }
      return [];
    }
  };
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:3001/uploads/${path}`;
  };
  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchInstance(`/auth/user/${user.id}`);
      updateUser(data);
      await AsyncStorage.setItem("user", JSON.stringify(data));
      console.log("✅ User refreshed:", data.name);
      return true;
    } catch (err) {
      console.error("❌ Error refreshing user:", err.message);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        isAuthenticated,
        user,
        cart,
        favorites,
        products,
        isOffline,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleFavorite,
        setOfflineStatus: setIsOffline,
        updateUser,
        getProducts,
        setProducts,
        searchProducts,
        getImageUrl,
        clearCartAndUpdateOrsers,
        refreshUser,
        GoogleSignup,
        orders
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
