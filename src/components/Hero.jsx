export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center px-6 py-20">
      <div className="max-w-[760px]">
        {/* Live status pill */}
        <div
          className="inline-flex items-center gap-2.5 mb-7 px-3.5 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-md text-[11px] tracking-[3px] uppercase text-muted animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-green animate-soft-ping" />
            <span className="relative rounded-full w-1.5 h-1.5 bg-green" />
          </span>
          <span>Sushi by Lite · Riyadh · Open now</span>
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(48px,8.5vw,96px)] font-black leading-[0.95] tracking-[-2.5px] mb-6 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Secure transactions
          <br />
          <span className="bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent italic font-light animate-text-shimmer">
            for your taste buds
          </span>
        </h1>

        {/* Description */}
        <p
          className="text-[16px] md:text-[17px] text-muted leading-[1.75] mb-10 max-w-[540px] mx-auto animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          Fresh sushi, checkout powered by the Lite Hosted Fields SDK — every
          order is encrypted end-to-end before it leaves your browser.
        </p>

        {/* CTA buttons */}
        <div
          className="inline-flex gap-3 flex-wrap justify-center animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <a
            href="#menu"
            className="group relative overflow-hidden bg-accent text-black rounded-lg px-8 py-[14px] text-[14px] font-bold no-underline transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_40px_-8px_rgba(200,169,110,0.55)]"
          >
            <span className="relative z-[1]">Explore Menu →</span>
            <span className="absolute inset-0 bg-gradient-to-r from-accent2 to-accent translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </a>
          <a
            href="#about"
            className="bg-surface/40 backdrop-blur-md text-text border border-border rounded-lg px-8 py-[14px] text-[14px] font-semibold no-underline transition-all duration-300 hover:border-accent hover:text-accent hover:-translate-y-[2px]"
          >
            Our Story
          </a>
        </div>

        {/* Stats strip */}
        <div
          className="mt-16 grid grid-cols-3 gap-8 max-w-[480px] mx-auto animate-fade-up"
          style={{ animationDelay: "480ms" }}
        >
          <Stat value="40+" label="Dishes" />
          <Stat value="40+" label="Chefs" />
          <Stat value="40+" label="Days in business" />
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#menu"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3 text-[10px] tracking-[3px] uppercase text-muted no-underline hover:text-accent transition-colors animate-fade-up"
        style={{ animationDelay: "600ms" }}
        aria-label="Scroll to menu"
      >
        <span>Scroll</span>
        <span className="relative w-px h-12 overflow-hidden bg-border">
          <span className="absolute top-0 left-0 w-full h-5 bg-accent animate-scroll-down" />
        </span>
      </a>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[22px] md:text-[24px] font-extrabold text-accent tracking-tight">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[2px] text-muted mt-1.5">
        {label}
      </div>
    </div>
  );
}
