import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { openCart, totals } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 h-16 backdrop-blur-[14px] transition-colors duration-300 ${
        scrolled
          ? 'bg-[rgba(10,10,10,0.78)] border-b border-border'
          : 'bg-[rgba(10,10,10,0.35)] border-b border-transparent'
      }`}
    >
      <div className="text-[22px] font-extrabold tracking-[3px] text-accent uppercase">
        Sushi<span className="text-text font-light"> by Lite</span>
      </div>
      <div className="hidden md:flex gap-8">
        <a
          href="#menu"
          className="text-[13px] text-muted no-underline tracking-[0.5px] transition-colors hover:text-text"
        >
          Menu
        </a>
        <a
          href="#about"
          className="text-[13px] text-muted no-underline tracking-[0.5px] transition-colors hover:text-text"
        >
          About
        </a>
      </div>
      <button
        onClick={openCart}
        className="flex items-center gap-2 bg-accent text-black border-none rounded-lg px-[18px] py-2 text-[13px] font-bold cursor-pointer transition-all hover:bg-accent2 hover:-translate-y-[1px] hover:shadow-[0_8px_22px_-8px_rgba(200,169,110,0.6)]"
      >
        🛒 Cart
        <span className="bg-black text-accent rounded-full w-[18px] h-[18px] text-[11px] font-extrabold flex items-center justify-center">
          {totals.count}
        </span>
      </button>
    </nav>
  );
}
