import { useState } from 'react';
import { BADGE_MAP } from '../data/menu.js';
import { useCart } from '../context/CartContext.jsx';

export default function MenuItem({ item }) {
  const { addToCart } = useCart();
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = Boolean(item.img) && !imgFailed;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-accent group">
      <div className="relative w-full h-[220px] bg-surface2 overflow-hidden">
        {hasImage ? (
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[72px]">
            {item.emoji}
          </div>
        )}
        {hasImage && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-[18px]">
            {item.emoji}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[1.5px] text-accent mb-1.5 font-semibold">
          {item.cat}
        </div>
        <div className="text-[17px] font-bold mb-1.5">
          {item.name}
          {item.badges.map((b) => (
            <span
              key={b}
              className={`inline-block text-[10px] font-bold px-[7px] py-0.5 rounded uppercase tracking-[0.5px] ml-1.5 ${BADGE_MAP[b].cls}`}
            >
              {BADGE_MAP[b].label}
            </span>
          ))}
        </div>
        <div className="text-[13px] text-muted leading-[1.6] mb-4">{item.desc}</div>
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-extrabold text-accent">
            <sup className="text-[12px] font-semibold">SAR </sup>
            {item.price}
          </div>
          <button
            onClick={() => addToCart(item.id)}
            className="w-9 h-9 rounded-full bg-accent border-none text-black text-[20px] font-bold cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-accent2 hover:scale-110"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
