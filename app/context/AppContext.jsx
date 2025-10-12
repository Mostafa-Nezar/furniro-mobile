import { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, darkColors } from "../constants/theme.jsx";
import { fetchInstance } from "./api";
import { useAuth } from "./AuthContext"; 
import { useCart } from "./CartContext"; 

const AppContext = createContext();
const initialState = { isDarkMode: false, favorites: [], products: [], theme: colors, loadingCancel: null, orders: [] };
const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_DARK_MODE": return { ...state, isDarkMode: action.payload, theme: action.payload ? darkColors : colors };
    case "TOGGLE_THEME":
      const newDarkMode = !state.isDarkMode;
      return { ...state, isDarkMode: newDarkMode, theme: newDarkMode ? darkColors : colors };
    case "SET_FAVORITES": return { ...state, favorites: action.payload };
    case "TOGGLE_FAVORITE": return state.favorites.includes(action.payload) ? { ...state, favorites: state.favorites.filter((id) => id !== action.payload) } : { ...state, favorites: [...state.favorites, action.payload] };
    case "SET_PRODUCTS": return { ...state, products: action.payload };
    case "SET_ORDERS": return { ...state, orders: action.payload };
    case "SET_LOADING_CANCEL": return { ...state, loadingCancel: action.payload };
    case "RESET": return { ...state, favorites: [], orders: [] };
    default: return state;
  }
};

export const AppProvider = ({ children }) => {
  const { user, isAuthenticated, updateUser, dispatch: authDispatch } = useAuth();
  const { clearCartAndUpdateOrsers } = useCart();
  const [state, dispatch] = useReducer(appReducer, initialState);
  useEffect(() => { loadStoredData();  }, []);
  useEffect(() => { saveDataToStorage(); }, [state.isDarkMode, state.favorites, user, isAuthenticated]);
  useEffect(() => { (user && user.id) ? fetchOrders(user.id):dispatch({ type: "SET_ORDERS", payload: [] }) }, [user]);

  const fetchOrders = async (userId) => {
    const data = await fetchInstance(`/orders/user/${userId}`);
    dispatch({ type: "SET_ORDERS", payload: data });
    return data;
  };
  const loadStoredData = async () => {
    try {
      const appDataRaw = await AsyncStorage.getItem("appData");
      const userRaw = await AsyncStorage.getItem("user");
      const appData = appDataRaw ? JSON.parse(appDataRaw) : {};
      const storedUser = userRaw ? JSON.parse(userRaw) : null;

      dispatch({ type: "SET_DARK_MODE", payload: appData.isDarkMode || false });
      dispatch({ type: "SET_FAVORITES", payload: appData.favorites || [] });

      authDispatch({ type: "SET_USER", payload: storedUser });
      authDispatch({ type: "SET_AUTH", payload: !!storedUser });
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };
  const saveDataToStorage = async () => {
    const appData = { 
      isDarkMode: state.isDarkMode, 
      favorites: state.favorites, 
      isAuthenticated 
    };
    await AsyncStorage.setItem("appData", JSON.stringify(appData));
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
  };
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("cart");
    authDispatch({ type: "LOGOUT" });
    dispatch({ type: "RESET" });
    return true;
  };
  const toggleTheme = () => { dispatch({ type: "TOGGLE_THEME" }) };
  const toggleFavorite = (id) => { dispatch({ type: "TOGGLE_FAVORITE", payload: id })};
  const getProducts = async () => {
    try {
      const data = await fetchInstance("/products/db");
      dispatch({ type: "SET_PRODUCTS", payload: data });
      await AsyncStorage.setItem("products", JSON.stringify(data));
      return data;
    } catch {
      const cached = await AsyncStorage.getItem("products");
      if (cached) {
        const parsed = JSON.parse(cached);
        dispatch({ type: "SET_PRODUCTS", payload: parsed });
        return parsed;
      }
      return [];
    }
  };
  const searchProducts = async (q) => {
    try {
      return await fetchInstance(`/products/db/${q}`);
    } catch {
      const cached = await AsyncStorage.getItem("products");
      if (cached) {
        const list = JSON.parse(cached);
        return list.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(q.toLowerCase())) ||
            (p.des && p.des.toLowerCase().includes(q.toLowerCase()))
        );

      }
      return [];
    }
  };
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return path;
  };
 const cancelOrder = async (orderId) => {
  try {
    dispatch({ type: "SET_LOADING_CANCEL", payload: orderId });
    const data = await fetchInstance(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "canceled" })
    });
    dispatch({
      type: "SET_ORDERS",
      payload: state.orders.map((o) =>
        o._id === orderId ? { ...o, status: "canceled" } : o
      )
    });
    return data;
  } finally {
    dispatch({ type: "SET_LOADING_CANCEL", payload: null });
  }
};



  return (
    <AppContext.Provider value={{ ...state, toggleTheme, toggleFavorite, getProducts, searchProducts, getImageUrl, cancelOrder, logout, user, isAuthenticated, updateUser, clearCartAndUpdateOrsers, fetchOrders }} >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
