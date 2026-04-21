import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { MENU } from '../data/menu.js';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, changeQty, totals } = useCart();
  const entries = Object.entries(cart);
  const hasItems = totals.count > 0;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    if (!hasItems || loading) return;
    setError(null);
    setLoading(true);
    try {
      const url = import.meta.env.VITE_CHECKOUT_SESSION_URL;
      if (!url) {
        throw new Error('VITE_CHECKOUT_SESSION_URL is not configured');
      }

      // Amount is sent in minor units (halalas for SAR).
      const amount = Math.round(totals.total * 100);
      const currency = 'SAR';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });

      if (!res.ok) {
        throw new Error(`Checkout session request failed (${res.status})`);
      }

      const data = await res.json();
      const clientSecret =
        data.client_secret || data.clientSecret || data.token;

      if (!clientSecret) {
        throw new Error('Response did not include a client_secret');
      }

      closeCart();
      navigate(`/checkout?cs=${encodeURIComponent(clientSecret)}`);
    } catch (err) {
      console.error('Failed to start checkout:', err);
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 z-[200] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 w-[400px] z-[201] bg-surface border-l border-border flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-[16px] font-bold">Your Order</h3>
          <button
            onClick={closeCart}
            className="bg-surface2 border-none text-text w-8 h-8 rounded-full cursor-pointer text-[14px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!hasItems ? (
            <div className="text-center py-[60px] text-muted">
              <div className="text-[48px] mb-3">🍣</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            entries.map(([id, qty]) => {
              const item = MENU.find((i) => i.id === +id);
              if (!item) return null;
              return (
                <div key={id} className="flex items-center gap-3 py-3 border-b border-border">
                  <div className="text-[28px] w-11 text-center">{item.emoji}</div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold mb-0.5">{item.name}</div>
                    <div className="text-[13px] text-accent">
                      SAR {(item.price * qty).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(+id, -1)}
                      className="w-[26px] h-[26px] rounded-full bg-surface2 border border-border text-text text-[14px] cursor-pointer flex items-center justify-center hover:border-accent hover:text-accent"
                    >
                      −
                    </button>
                    <span className="text-[14px] font-bold w-5 text-center">{qty}</span>
                    <button
                      onClick={() => changeQty(+id, 1)}
                      className="w-[26px] h-[26px] rounded-full bg-surface2 border border-border text-text text-[14px] cursor-pointer flex items-center justify-center hover:border-accent hover:text-accent"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 border-t border-border">
          <div className="flex justify-between mb-1.5 text-[13px] text-muted">
            <span>Subtotal</span>
            <span>SAR {totals.sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1.5 text-[13px] text-muted">
            <span>VAT (15%)</span>
            <span>SAR {totals.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between my-3 mb-5 text-[18px] font-extrabold">
            <span>Total</span>
            <span className="text-accent">SAR {totals.total.toFixed(2)}</span>
          </div>
          {error && (
            <div className="mb-3 text-[12px] text-red bg-red/10 border border-red/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <button
            onClick={handleCheckout}
            disabled={!hasItems || loading}
            className={`block w-full py-3.5 px-0 rounded-[10px] text-[15px] font-bold text-center border-none transition-colors ${
              hasItems && !loading
                ? 'bg-accent text-black cursor-pointer hover:bg-accent2'
                : 'bg-border text-muted cursor-not-allowed'
            }`}
          >
            {loading ? 'Starting checkout…' : 'Proceed to Checkout →'}
          </button>
        </div>
      </div>
    </>
  );
}
