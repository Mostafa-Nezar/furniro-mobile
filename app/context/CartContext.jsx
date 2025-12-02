import { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { fetchInstance } from "./api";
import Toast from "react-native-toast-message";

const CartContext = createContext();

const initialState = { cart: [], loading: false, error: null };

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload };
    case "ADD_ITEM":
      return { ...state, cart: [...state.cart, action.payload] };
    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
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
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const syncCart = async (cart) => {

      const data = await fetchInstance(`/auth/cart/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cart }),
      });
  
      dispatch({ type: "SET_CART", payload: data.cart });
      await AsyncStorage.setItem("cart", JSON.stringify(data.cart));
      Toast.show({ type: "success", text1: "Success", text2: data.msg });
  
      return data.cart;

  };
  
  
  const addToCart = async (product) => {
    const existingItem = state.cart.find((item) => item.id === product.id);
  
    const updatedCart = existingItem
      ? state.cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [
          ...state.cart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            size: "l",
            color: "#B88E2F",
          },
        ];
  
    await syncCart(updatedCart);
  };
  

  const decreaseCartQuantity = async (product) => {
    const updatedCart = state.cart
      .map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
  
    await syncCart(updatedCart);
  };
  

  const clearCartAndUpdateOrsers = async (
    paymentMethod = "cash on delivery"
  ) => {
    if (!user?.id) return;

    const total = state.cart.reduce(
      (sum, p) => sum + p.price * (p.quantity || 1),
      0
    );

    const orderData = {
      userId: user.id,
      products: state.cart,
      date: new Date().toISOString(),
      total,
      payment: { method: paymentMethod, status: "pending" },
      customerInfo: {
        fullName: user.name || "",
        email: user.email || "",
        address: user.location || "",
        phoneNumber: user.phoneNumber || null,
      },
      paymentdone: "cash on delivery",
      status: "pending",
      userlocation: user.location || "",
    };

    try {
      await fetchInstance("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      await fetchInstance(`/auth/cart/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cart: [] }),
      });

      await syncCart([]);
    } catch (error) {
      console.error("❌ Error while saving order or clearing cart:", error);
    }
  };

  const clearCart = async () => {
    await syncCart([]);
  };

  const removeFromCart = async (product) => {
    const updatedCart = state.cart.filter((item) => item.id !== product.id);
    await syncCart(updatedCart);
  };

  useEffect(() => {
    const loadCart = async () => {
      if (user?.id) {
        const userData = await fetchInstance(`/auth/cart/${user.id}`);
        if (
          userData?.cart &&
          Array.isArray(userData.cart) &&
          userData.cart.length > 0
        ) {
          dispatch({ type: "SET_CART", payload: userData.cart });
          await AsyncStorage.setItem("cart", JSON.stringify(userData.cart));
          return;
        }
      }

      const savedCart = await AsyncStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          dispatch({ type: "SET_CART", payload: parsedCart });
        }
      }
    };
    loadCart();
  }, [user?.id]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        decreaseCartQuantity,
        clearCartAndUpdateOrsers,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
