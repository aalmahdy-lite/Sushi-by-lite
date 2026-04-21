import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { openCart, totals } = useCart();
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[rgba(10,10,10,0.92)] backdrop-blur-[12px] border-b border-border flex items-center justify-between px-12 h-16">
      <div className="text-[22px] font-extrabold tracking-[3px] text-accent uppercase">
        Sushi<span className="text-text font-light"> by Lite</span>
      </div>
      <div className="flex gap-8">
        <a href="#menu" className="text-[13px] text-muted no-underline tracking-[0.5px] transition-colors hover:text-text">Menu</a>
        <a href="#about" className="text-[13px] text-muted no-underline tracking-[0.5px] transition-colors hover:text-text">About</a>
      </div>
      <button
        onClick={openCart}
        className="flex items-center gap-2 bg-accent text-black border-none rounded-lg px-[18px] py-2 text-[13px] font-bold cursor-pointer transition-colors hover:bg-accent2"
      >
        🛒 Cart
        <span className="bg-black text-accent rounded-full w-[18px] h-[18px] text-[11px] font-extrabold flex items-center justify-center">
          {totals.count}
        </span>
      </button>
    </nav>
  );
}
