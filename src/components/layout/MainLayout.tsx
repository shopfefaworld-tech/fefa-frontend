'use client';

import { motion, AnimatePresence } from 'framer-motion';
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


  return (
    <>
      <TopBanner />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="lg:min-h-screen bg-white transition-colors duration-300 pt-20 sm:pt-24 md:pt-28 lg:pt-32"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <MobileNavBar />
      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} redirectTo={redirectTo} />
    </>
  );
}
