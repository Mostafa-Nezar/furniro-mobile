import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, darkColors } from "../constants/theme.jsx";

const AppContext = createContext();

const initialState = {
  isDarkMode: false,
  isAuthenticated: false,
  user: null,
  cart: [],
  favorites: [],
  products: [],
  isOffline: false,
  theme: colors,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_THEME":
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
        theme: !state.isDarkMode ? darkColors : colors,
      };
    case "SET_THEME":
      return {
        ...state,
        isDarkMode: action.payload,
        theme: action.payload ? darkColors : colors,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        cart: [],
        favorites: [],
      };

    case "ADD_TO_CART":
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "TOGGLE_FAVORITE":
      const isFavorite = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter((id) => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload,
      };
    case "SET_OFFLINE_STATUS":
      return {
        ...state,
        isOffline: action.payload,
      };
    case "LOAD_STORED_DATA":
      return {
        ...state,
        ...action.payload,
        theme: action.payload.isDarkMode ? darkColors : colors,
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    saveDataToStorage();
  }, [
    state.isDarkMode,
    state.cart,
    state.favorites,
    state.user,
    state.isAuthenticated,
  ]);

  const loadStoredData = async () => {
    try {
      const appDataRaw = await AsyncStorage.getItem("appData");
      const userRaw = await AsyncStorage.getItem("user");

      const appData = appDataRaw ? JSON.parse(appDataRaw) : {};
      const user = userRaw ? JSON.parse(userRaw) : null;

      dispatch({
        type: "LOAD_STORED_DATA",
        payload: {
          ...appData,
          user,
        },
      });
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  const saveDataToStorage = async () => {
    try {
      const appData = {
        isDarkMode: state.isDarkMode,
        favorites: state.favorites,
        isAuthenticated: state.isAuthenticated,
      };

      await AsyncStorage.setItem("appData", JSON.stringify(appData));
      await AsyncStorage.setItem("user", JSON.stringify(state.user));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const addToCart = (product) => {
    const existingItem = state.cart.find((item) => item.id === product.id);

    const filteredProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: existingItem ? existingItem.quantity + 1 : 1,
    };

    dispatch({ type: "ADD_TO_CART", payload: filteredProduct });
    addProductToBackendCart(filteredProduct);
  };

  const addProductToBackendCart = async (filteredProduct) => {
    try {
      if (state.user?.id) {
        const res = await fetch(
          `http://localhost:3001/api/users/${state.user.id}/add-to-cart`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ product: filteredProduct }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          const updatedUser = {
            ...state.user,
            cart: data.cart, // ✅ كارت محدث من السيرفر
          };
          dispatch({ type: "LOGIN", payload: updatedUser });
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error syncing cart with backend:", error);
    }
  };

  const removeFromCart = async (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    await removeProductFromBackendCart(productId);
  };

  const removeProductFromBackendCart = async (productId) => {
    try {
      if (state.user?.id) {
        const res = await fetch(
          `http://localhost:3001/api/users/${state.user.id}/remove-from-cart`,
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
          const updatedUser = {
            ...state.user,
            cart: data.cart,
          };
          dispatch({ type: "LOGIN", payload: updatedUser });
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error syncing cart removal with backend:", error);
    }
  };

  const value = {
    ...state,
    dispatch,
    toggleTheme: () => dispatch({ type: "TOGGLE_THEME" }),
    login: (user) => {
      dispatch({ type: "LOGIN", payload: user });
      user?.cart?.forEach((item) => {
        dispatch({ type: "ADD_TO_CART", payload: item });
      });
    },

    logout: () => dispatch({ type: "LOGOUT" }),
    addToCart,
    removeFromCart,
    updateCartQuantity: (productId, quantity) =>
      dispatch({
        type: "UPDATE_CART_QUANTITY",
        payload: { id: productId, quantity },
      }),
    toggleFavorite: (productId) =>
      dispatch({ type: "TOGGLE_FAVORITE", payload: productId }),
    setProducts: (products) =>
      dispatch({ type: "SET_PRODUCTS", payload: products }),
    setOfflineStatus: (status) =>
      dispatch({ type: "SET_OFFLINE_STATUS", payload: status }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
