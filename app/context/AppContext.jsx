import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, darkColors } from '../constants/theme.jsx';

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
    case 'TOGGLE_THEME':
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
        theme: !state.isDarkMode ? darkColors : colors,
      };
    case 'SET_THEME':
      return {
        ...state,
        isDarkMode: action.payload,
        theme: action.payload ? darkColors : colors,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
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
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'TOGGLE_FAVORITE':
      const isFavorite = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };
    case 'SET_OFFLINE_STATUS':
      return {
        ...state,
        isOffline: action.payload,
      };
    case 'LOAD_STORED_DATA':
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

  // Load stored data on app start
  useEffect(() => {
    loadStoredData();
  }, []);

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    saveDataToStorage();
  }, [state.isDarkMode, state.cart, state.favorites, state.user]);

  const loadStoredData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('appData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        dispatch({ type: 'LOAD_STORED_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const saveDataToStorage = async () => {
    try {
      const dataToStore = {
        isDarkMode: state.isDarkMode,
        cart: state.cart,
        favorites: state.favorites,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      };
      await AsyncStorage.setItem('appData', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const value = {
    ...state,
    dispatch,
    toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
    login: (user) => dispatch({ type: 'LOGIN', payload: user }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    addToCart: (product) => dispatch({ type: 'ADD_TO_CART', payload: product }),
    removeFromCart: (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    updateCartQuantity: (productId, quantity) => 
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: productId, quantity } }),
    toggleFavorite: (productId) => dispatch({ type: 'TOGGLE_FAVORITE', payload: productId }),
    setProducts: (products) => dispatch({ type: 'SET_PRODUCTS', payload: products }),
    setOfflineStatus: (status) => dispatch({ type: 'SET_OFFLINE_STATUS', payload: status }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

