import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { MENU } from '../data/menu.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const addToCart = useCallback((id) => {
    const item = MENU.find((i) => i.id === id);
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    if (item) showToast(`<span class="text-accent">${item.emoji} ${item.name}</span> added`);
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      next[id] = (next[id] || 0) + delta;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totals = useMemo(() => {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    const sub = Object.entries(cart).reduce(
      (s, [id, q]) => s + (MENU.find((i) => i.id === +id)?.price || 0) * q,
      0
    );
    const vat = sub * 0.15;
    const total = sub + vat;
    return { count, sub, vat, total };
  }, [cart]);

  const value = {
    cart,
    setCart,
    addToCart,
    changeQty,
    isOpen,
    openCart,
    closeCart,
    toast,
    showToast,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
