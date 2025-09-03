// src/context/AppContext.js
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, darkColors } from "../constants/theme.jsx";
import { fetchInstance } from "./api";
import { useAuth } from "./AuthContext"; 
import { useCart } from "./CartContext"; 

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, setUser, isAuthenticated, setIsAuthenticated, updateUser } = useAuth();
  const { clearCartAndUpdateOrsers } = useCart();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [theme, setTheme] = useState(colors);
  const [loadingCancel, setLoadingCancel] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadStoredData(); }, []);

  useEffect(() => {
    saveDataToStorage();
  }, [isDarkMode, favorites, user, isAuthenticated]);

  useEffect(() => {
    if (user && user.id) {
      fetchOrders(user.id);
    } else {
      setOrders([]); // Clear orders on logout
    }
  }, [user]);

  const fetchOrders = async (userId) => {
    const response = await fetch(`https://furniro-back-production.up.railway.app/api/orders/user/${userId}` );
    if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
    const data = await response.json();
    setOrders(data);
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
      
      setIsAuthenticated(!!storedUser); // More robust check
      setUser(storedUser);

      setTheme(appData.isDarkMode ? darkColors : colors);
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  const saveDataToStorage = async () => {
    const appData = { isDarkMode, favorites, isAuthenticated };
    await AsyncStorage.setItem("appData", JSON.stringify(appData));
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setFavorites([]);
    return true;
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    setTheme(newTheme ? darkColors : colors);
  };

  const toggleFavorite = (id) => {
    favorites.includes(id)
      ? setFavorites(favorites.filter((fav) => fav !== id))
      : setFavorites([...favorites, id]);
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
    if (path.startsWith("http" )) return path;
  };

  const cancelOrder = async (orderId) => {
    try {
      setLoadingCancel(orderId);
      const data = await fetchInstance(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "canceled" }),
      });
      console.log("✅ Order canceled:", data);
      await fetchOrders(user.id); 
      return data;
    } finally {
      setLoadingCancel(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode, favorites, products, theme, toggleTheme,
        toggleFavorite, getProducts, setProducts, searchProducts, getImageUrl,
        orders, cancelOrder, loadingCancel,
        logout,
        user, isAuthenticated, updateUser, clearCartAndUpdateOrsers
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
