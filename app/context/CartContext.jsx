import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext"; // Correctly importing useAuth
import { fetchInstance } from "./api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, updateUser } = useAuth();

  const cart = user?.cart || [];

  const addToCart = async (product) => {
    if (!user?.id) return;
    const existingItem = cart.find((item) => item.id === product.id);
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }];
    }
    await fetchInstance(`/auth/user/${user.id}`, { method: "PATCH", body: JSON.stringify({ cart: updatedCart }) });
    await updateUser({ cart: updatedCart }); // Using updateUser to keep user state consistent
  };

  const removeFromCart = async (productId) => {
    if (!user?.id) return;
    const updatedCart = cart.filter((item) => item.id !== productId);
    await fetchInstance(`/auth/user/${user.id}`, { method: "PATCH", body: JSON.stringify({ cart: updatedCart }) });
    await updateUser({ cart: updatedCart });
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (!user?.id) return;
    // Your updateCartQuantity logic as is, but using updateUser
    let updatedCart;
    if (newQuantity < 1) {
      updatedCart = cart.filter((item) => item.id !== productId);
    } else {
      updatedCart = cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    }
    await fetchInstance(`/auth/user/${user.id}`, { method: "PATCH", body: JSON.stringify({ cart: updatedCart }) });
    await updateUser({ cart: updatedCart });
  };

  const clearCartAndUpdateOrsers = async (paymentMethod = "cash on delivery") => {
    if (!user?.id) return;
    await fetchInstance("/orders", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        products: user.cart,
        date: new Date().toISOString(),
        total: user.cart.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0),
        payment: paymentMethod,
      }),
    });
    await fetchInstance(`/auth/user/${user.id}`, { method: "PATCH", body: JSON.stringify({ cart: [] }) });
    await updateUser({ cart: [] });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, clearCartAndUpdateOrsers }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
