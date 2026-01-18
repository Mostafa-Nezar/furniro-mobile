import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { fetchInstance } from "./api";
import Toast from "react-native-toast-message";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const cart = user?.cart && Array.isArray(user.cart) ? user.cart : [];

  const updateCartOnServer = async (newCart) => {
    if (!user?.id) 
    return  Toast.show({ type: "error", text1: "Authentication Error", text2: "You must be logged in to modify the cart." });
    try {
      const response = await fetchInstance(`/auth/cart/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cart: newCart }),
      });
      updateUser({ cart: response.cart });
      return true; 

    } catch (error) {
      console.error("❌ Error updating cart on backend:", error.data?.msg || error.message);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.data?.msg || "Could not update your cart.",
      });
    }
  };

  const updateItemAttribute = async (productId, attributeKey, attributeValue) => {
    const existingItem = cart.find((item) => item.id === productId);
    if (!existingItem) return Toast.show({ type: "error", text1: "Not In Cart", text2: "Add the item to the cart first." });
       
    const updatedCart = cart.map((item) => item.id === productId ? { ...item, [attributeKey]: attributeValue } : item);
    const success = await updateCartOnServer(updatedCart);
    if (success) Toast.show({ type: "success", text1: `Updated successfully`, text2:attributeKey });
    
  };

  const addToCart = async (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const cartQuantity = existingItem ? existingItem.quantity : 0;

    if (product.quantity <= 0) {
      return Toast.show({ type: "error", text1: product.name, text2: "Out of stock" });
    }
    if (cartQuantity >= product.quantity) {
      return Toast.show({ type: "error", text1: product.name, text2: `Only ${product.quantity} in stock` });
    }
    if (cartQuantity >= 10) {
      return Toast.show({ type: "error", text1: product.name, text2: "You can only add 10 items" });
    }

    const updatedCart = existingItem
      ? cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...cart, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, size: "l", color: "#B88E2F" }];

    const success = await updateCartOnServer(updatedCart);

    if (success) {
      Toast.show({ type: "success", text1: "Added To Cart!", text2: product.name });
    }
  };

  const decreaseCartQuantity = async (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (!existingItem) {
      return Toast.show({ type: "error", text1: product.name, text2: "Not in your cart" });
    }

    const updatedCart = cart
      .map((item) => (item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0);

    const success = await updateCartOnServer(updatedCart);
    if (success) {
      Toast.show({ type: "success", text1: "Cart Updated!", text2: product.name });
    }
  };

  const removeFromCart = async (product) => {
    const updatedCart = cart.filter((item) => item.id !== product.id);
    const success = await updateCartOnServer(updatedCart);
    if (success) {
      Toast.show({ type: "success", text1: "Removed From Cart!", text2: product.name });
    }
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

    } catch (error) {
      console.error("❌ Error while saving order or clearing cart:", error);
    }
  };

  const clearCart = async () =>{
    if (cart.length === 0) return; 
    await updateCartOnServer([]);
  };
  
  return (
    <CartContext.Provider value={{ cart,updateItemAttribute, addToCart, removeFromCart, decreaseCartQuantity, clearCartAndUpdateOrsers, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
