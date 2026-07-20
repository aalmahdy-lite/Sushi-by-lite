import { useState } from 'react';
import { MENU } from '../data/menu.js';
import MenuItem from './MenuItem.jsx';
import Reveal from './Reveal.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'combos', label: 'Combos' },
  { id: 'nigiri', label: 'Nigiri' },
  { id: 'maki', label: 'Maki Rolls' },
  { id: 'sashimi', label: 'Sashimi' },
  { id: 'hot', label: 'Hot Dishes' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'desserts', label: 'Desserts' },
];

export default function Menu() {
  const [filter, setFilter] = useState('all');
  const items = filter === 'all' ? MENU : MENU.filter((i) => i.cat === filter);

  return (
    <div className="relative px-12 py-[100px] max-w-[1280px] mx-auto" id="menu">
      <Reveal>
        <div className="text-center mb-[60px]">
          <div className="text-[11px] tracking-[4px] uppercase text-accent mb-3">
            The Menu
          </div>
          <h2 className="text-[36px] font-extrabold tracking-[-0.5px]">
            Combos, nigiri &amp;{' '}
            <span className="text-accent italic font-light">
              everything in between
            </span>
          </h2>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="flex gap-2 justify-center mb-12 flex-wrap">
          {CATEGORIES.map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`px-5 py-2 rounded-[20px] text-[13px] font-semibold cursor-pointer border transition-all ${
                  active
                    ? 'bg-accent text-black border-accent'
                    : 'bg-surface/40 backdrop-blur-sm border-border text-muted hover:bg-accent hover:text-black hover:border-accent'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {items.map((item, idx) => (
          <Reveal key={item.id} delay={Math.min(idx * 60, 360)}>
            <MenuItem item={item} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
