import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "../api/carts.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const data = await addCartItem({ productId, quantity });
    setCart(data);
    return data;
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const data = await updateCartItem(itemId, quantity);
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const data = await removeCartItem(itemId);
    setCart(data);
    return data;
  }, []);

  const itemCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart],
  );

  const value = useMemo(
    () => ({ cart, isLoading, error, itemCount, refresh, addItem, updateItem, removeItem }),
    [cart, isLoading, error, itemCount, refresh, addItem, updateItem, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
