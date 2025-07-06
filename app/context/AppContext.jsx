import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, darkColors } from "../constants/theme.jsx";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [theme, setTheme] = useState(colors);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    saveDataToStorage();
  }, [isDarkMode, cart, favorites, user, isAuthenticated]);

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
    try {
      if (user?.id) {
        const res = await fetch(
          `http://localhost:3001/api/cart/${user.id}/add-to-cart`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1,
            }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          // تحديث الكارت المحلي من بيانات السيرفر (باك)
          setCart(data.cart);

          // تحديث اليوزر بالكارت الجديد
          const updatedUser = {
            ...user,
            cart: data.cart,
          };
          setUser(updatedUser);
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error syncing cart with backend:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (user?.id) {
        const res = await fetch(
          `http://localhost:3001/api/cart/${user.id}/remove-from-cart`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          // تحديث الكارت المحلي بالبيانات الجديدة من الباك
          setCart(data.cart);

          // تحديث اليوزر بالكارت الجديد
          const updatedUser = {
            ...user,
            cart: data.cart,
          };
          setUser(updatedUser);
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error syncing cart removal with backend:", error);
    }
  };

  const updateCartQuantity = (id, quantity) => {
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok)
        return { success: false, message: data.msg || "Login failed" };

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
      return { success: false, message: "Network error" };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok)
        return { success: false, message: data.msg || "Registration failed" };
      return await login(data.user.email, userData.password);
    } catch (error) {
      const newUser = { id: Date.now(), ...userData, avatar: null };
      await AsyncStorage.setItem("token", "mock_token_123");
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true, user: newUser };
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

  const getProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/products/db");
      const data = await res.json();
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
      const res = await fetch(
        `http://localhost:3001/api/products/db/search?q=${q}`
      );
      return await res.json();
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

  const value = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
