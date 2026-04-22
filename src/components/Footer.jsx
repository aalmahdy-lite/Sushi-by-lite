import Reveal from './Reveal.jsx';

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-bg/30 backdrop-blur-md px-12 py-12 text-center text-muted text-[13px]">
      <Reveal>
        <div className="text-[18px] font-extrabold tracking-[3px] text-accent mb-2">
          SUSHI BY LITE
        </div>
        <p>Secure transactions for your taste buds</p>
      </Reveal>
    </footer>
  );
}
