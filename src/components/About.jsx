import Reveal from './Reveal.jsx';

export default function About() {
  return (
    <div
      id="about"
      className="relative bg-surface/40 backdrop-blur-md border-t border-b border-border px-12 py-24"
    >
      <div className="max-w-[680px] mx-auto text-center">
        <Reveal>
          <div className="text-[11px] tracking-[4px] uppercase text-accent mb-3">
            Our Philosophy
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="text-[32px] font-extrabold mb-5 tracking-[-0.5px]">
            Secure transactions —{' '}
            <span className="text-accent italic font-light">
              for your taste buds
            </span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="text-[15px] text-muted leading-[1.9]">
            Sushi by Lite pairs thoughtfully sourced sushi with a checkout you
            can trust. Card data never touches our servers — each field is
            rendered inside an isolated Lite SDK iframe and encrypted before it
            leaves your browser.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
