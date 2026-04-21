import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Menu from '../components/Menu.jsx';
import About from '../components/About.jsx';
import Footer from '../components/Footer.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import Toast from '../components/Toast.jsx';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.title = 'Sushi by Lite — Secure transactions for your taste buds';
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Menu />
      <About />
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  );
}
