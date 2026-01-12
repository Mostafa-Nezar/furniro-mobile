import { createContext, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { fetchInstance } from "./api";
import Toast from "react-native-toast-message";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const cart = user?.cart && Array.isArray(user.cart) ? user.cart : [];

  const syncCart = async (cart) => {
    const token = await AsyncStorage.getItem("token");
    if (user?.id) {
      await updateUser({ cart });
      try {
      const res =  await fetchInstance(`/auth/cart/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ cart }),
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } 
        });
      await AsyncStorage.setItem("cart", JSON.stringify(res.cart));
      } catch (error) {
        console.error("❌ Error syncing cart to backend:", error);
      }
    }
  };

  const addToCart = async (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const cartQuantity = existingItem ? existingItem.quantity : 0;

    if (product.quantity <= 0)
      return Toast.show({
        type: "error",
        text1: product.name,
        text2: "Out of stock",
      });

    if (cartQuantity >= product.quantity)
      return Toast.show({
        type: "error",
        text1: product.name,
        text2: `Only ${product.quantity} in stock`,
      });

    if (cartQuantity >= 10)
      return Toast.show({
        type: "error",
        text1: product.name,
        text2: "You can only 10 items",
      });

    const updatedCart = existingItem
      ? cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [
          ...cart,
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
    Toast.show({
      type: "success",
      text1: "Added To Cart !",
      text2: product.name,
    });
  };

  const decreaseCartQuantity = async (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (!existingItem)
      return Toast.show({
        type: "error",
        text1: product.name,
        text2: "Not In your Cart",
      });
    const updatedCart = cart
      .map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    await syncCart(updatedCart);
        Toast.show({
      type: "success",
      text1: "Cart Updated !",
      text2: product.name,
    });
  };

  const clearCartAndUpdateOrsers = async (
    paymentMethod = "cash on delivery"
  ) => {
    if (!user?.id) return;

    const total = cart.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0);

    const orderData = {
      userId: user.id,
      products: cart,
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

  const removeFromCart = async (product) => {
    const updatedCart = cart.filter((item) => item.id !== product.id);
    await syncCart(updatedCart);
        Toast.show({
      type: "success",
      text1: "Removed From Cart !",
      text2: product.name,
    });
  };

  useEffect(() => {
       if (user?.cart && Array.isArray(user.cart)) {
      AsyncStorage.setItem("cart", JSON.stringify(user.cart));
    } else if (!user) {
      AsyncStorage.getItem("cart").then((savedCart) => {
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          }
        }
      });
    }  
  }, [user?.cart, user]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseCartQuantity, clearCartAndUpdateOrsers, syncCart }} >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
