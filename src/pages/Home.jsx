import { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Menu from '../components/Menu.jsx';
import About from '../components/About.jsx';
import Footer from '../components/Footer.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import Toast from '../components/Toast.jsx';
import SiteBackground from '../components/SiteBackground.jsx';

export default function Home() {
  useEffect(() => {
    document.title = 'Sushi by Lite — Secure transactions for your taste buds';
  }, []);

  return (
    <>
      <SiteBackground />
      <div className="relative z-[1]">
        <Navbar />
        <Hero />
        <Menu />
        <About />
        <Footer />
      </div>
      <CartDrawer />
      <Toast />
    </>
  );
}
