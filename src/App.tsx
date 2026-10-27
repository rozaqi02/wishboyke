import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';

import { ScrollToTop } from './components/ScrollToTop';
import { BackToTop } from './components/BackToTop';
import { WhatsAppButton } from './components/WhatsAppButton';

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-neutral-surface text-gray-900 antialiased font-sans">
          {/* Main Navigation Header */}
          <Navbar />

          {/* Slide-over Cart Drawer */}
          <CartDrawer />

          {/* Route Outlet */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/tracking" element={<OrderTracking />} />
              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer with Medical Authority & Trust Pillars */}
          <Footer />

          {/* Floating WhatsApp Action matching UMA Women catalog view */}
          <WhatsAppButton />

          {/* Floating Back to Top Button */}
          <BackToTop />
        </div>
      </CartProvider>
    </Router>
  );
};

export default App;
