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
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const syncCart = (cart) => {
    dispatch({ type: "SET_CART", payload: cart });
    AsyncStorage.setItem("cart", JSON.stringify(cart));
  };
  const addToCart = (product) => {
    const existingItem = state.cart.find((item) => item.id === product.id);
    const cartQuantity = existingItem ? existingItem.quantity : 0;

    if (product.quantity <= 0)
      return Toast.show({ type: "error", text1: product.name, text2: "Out of stock" });

    if (cartQuantity >= product.quantity)
      return Toast.show({ type: "error", text1: product.name, text2: `Only ${product.quantity} in stock` });

    if (cartQuantity >= 10)
      return Toast.show({ type: "error", text1: product.name, text2: "You can only 10 items" });

    const updatedCart = existingItem
      ? state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [
          ...state.cart,
          { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, size: "l", color: "#B88E2F" },
        ];

    syncCart(updatedCart);
    Toast.show({ type: "success", text1: "Added To Cart !", text2: product.name });
  };
  const decreaseCartQuantity = (product) => {
    const existingItem = state.cart.find((item) => item.id === product.id);
    if (!existingItem)
      return Toast.show({ type: "error", text1: product.name, text2: "Not In your Cart" });
      const updatedCart = state.cart.map((item) =>item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
      syncCart(updatedCart);
  };
  const clearCartAndUpdateOrsers = async (paymentMethod = "cash on delivery") => {
      if (!user?.id) return;

      const total = state.cart.reduce((sum, p) => sum + (p.price * (p.quantity || 1)),0);

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
        },
        paymentdone:"cash on delivery" ,
        status: "pending",
        userlocation: user.location || "",
      };

      try {
        await fetchInstance("/orders", {
          method: "POST",
          body: JSON.stringify(orderData),
        });

        await fetchInstance(`/auth/user/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ cart: [] }),
        });

        syncCart([]);
      } catch (error) {
        console.error("❌ Error while saving order or clearing cart:", error);
      }
  };
  const clearCart = async () => {
    syncCart([]);
  };
  const removeFromCart = async (product) => {
    const updatedCart = state.cart.filter((item) => item.id !== product.id);
    syncCart(updatedCart);
  };
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = await AsyncStorage.getItem("cart");
      if (savedCart) {
        dispatch({ type: "SET_CART", payload: JSON.parse(savedCart) });
      } else if (user?.cart) {
        dispatch({ type: "SET_CART", payload: user.cart });
      }
    };
    loadCart();
  }, [user?.cart]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        decreaseCartQuantity,
        clearCartAndUpdateOrsers,
        clearCart,
        syncCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
