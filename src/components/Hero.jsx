export default function Hero() {
  return (
    <div className="h-screen flex items-center justify-center text-center relative overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 bg-hero-dots" />
      <div className="relative z-[2] max-w-[700px] px-6">
        <div className="text-[12px] tracking-[4px] uppercase text-accent mb-6">
          Sushi by Lite
        </div>
        <h1 className="text-[clamp(48px,8vw,84px)] font-black leading-[1.0] tracking-[-2px] mb-5">
          Secure transactions
          <br />
          <span className="text-accent italic font-light">for your taste buds</span>
        </h1>
        <p className="text-[16px] text-muted leading-[1.7] mb-10 max-w-[480px] mx-auto">
          Fresh sushi, checkout powered by the Lite Hosted Fields SDK — every order is encrypted end-to-end before it leaves your browser.
        </p>
        <div className="inline-flex gap-3 flex-wrap justify-center">
          <a
            href="#menu"
            className="bg-accent text-black border-none rounded-lg px-8 py-[14px] text-[14px] font-bold cursor-pointer no-underline transition-all hover:bg-accent2 hover:-translate-y-[1px]"
          >
            Explore Menu
          </a>
          <a
            href="#about"
            className="bg-transparent text-text border border-border rounded-lg px-8 py-[14px] text-[14px] font-semibold cursor-pointer no-underline transition-all hover:border-accent hover:text-accent"
          >
            Our Story
          </a>
        </div>
      </div>
    </div>
  );
}
