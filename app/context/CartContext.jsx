import { createContext, useContext, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { fetchInstance } from "./api";

const CartContext = createContext();

const initialState = {
  cart: [],
  loading: false,
  error: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload };
    case "ADD_ITEM":
      return { ...state, cart: [...state.cart, action.payload] };
    case "REMOVE_ITEM":
      return { ...state, cart: state.cart.filter((item) => item.id !== action.payload) };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ✅ sync with user.cart
  const syncCart = (cart) => {
    dispatch({ type: "SET_CART", payload: cart });
    updateUser({ cart });
    AsyncStorage.setItem("user", JSON.stringify({ ...user, cart }));
  };

  const addToCart = async (product) => {
    if (!user?.id) return;
    const existingItem = state.cart.find((item) => item.id === product.id);
    let updatedCart;
    if (existingItem) {
      updatedCart = state.cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [
        ...state.cart,
        { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 },
      ];
    }
    await fetchInstance(`/auth/user/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ cart: updatedCart }),
    });
    syncCart(updatedCart);
  };

  const removeFromCart = async (productId) => {
    if (!user?.id) return;
    const updatedCart = state.cart.filter((item) => item.id !== productId);
    await fetchInstance(`/auth/user/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ cart: updatedCart }),
    });
    syncCart(updatedCart);
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (!user?.id) return;
    let updatedCart;
    if (newQuantity < 1) {
      updatedCart = state.cart.filter((item) => item.id !== productId);
    } else {
      updatedCart = state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    }
    await fetchInstance(`/auth/user/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ cart: updatedCart }),
    });
    syncCart(updatedCart);
  };

  const clearCartAndUpdateOrders = async (paymentMethod = "cash on delivery") => {
    if (!user?.id) return;
    await fetchInstance("/orders", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        products: state.cart,
        date: new Date().toISOString(),
        total: state.cart.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0),
        payment: paymentMethod,
      }),
    });
    await fetchInstance(`/auth/user/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ cart: [] }),
    });
    syncCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCartAndUpdateOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
