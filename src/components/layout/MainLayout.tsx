'use client';

import { FaWhatsapp } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';
import MobileNavBar from './MobileNavBar';
import TopBanner from './TopBanner';
import LoginModal from '@/components/auth/LoginModal';
import { useLoginModal } from '@/contexts/LoginModalContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isLoginOpen, closeLoginModal, redirectTo } = useLoginModal();

  const whatsappNumber = '919992224842'; // Country code + number
  const whatsappMessage = encodeURIComponent(
    "Hi FEFA team, I just visited your website and I’d love some help picking the right jewelry for me."
  );

  return (
    <>
      <TopBanner />
      <Header />
      <main className="lg:min-h-screen bg-white transition-colors duration-300 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
        {children}
      </main>

      {/* Floating WhatsApp Chat Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with FEFA on WhatsApp"
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40"
      >
        <div className="relative group">
          <div className="absolute inset-0 -m-1 rounded-full bg-emerald-400/40 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 flex items-center justify-center text-white hover:bg-[#1ebe5a] transition-all duration-200 hover:scale-105">
            <FaWhatsapp className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </div>
      </a>

      <Footer />
      <MobileNavBar />
      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} redirectTo={redirectTo} />
    </>
  );
}
