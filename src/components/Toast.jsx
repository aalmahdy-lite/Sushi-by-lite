import { useCart } from '../context/CartContext.jsx';

export default function Toast() {
  const { toast } = useCart();
  const show = !!toast;
  return (
    <div
      className={`fixed bottom-6 left-1/2 bg-surface2 border border-border rounded-[10px] px-5 py-3 text-[13px] font-semibold z-[300] transition-transform duration-300 whitespace-nowrap shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
        show ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[80px]'
      }`}
      dangerouslySetInnerHTML={{ __html: toast ?? '' }}
    />
  );
}
