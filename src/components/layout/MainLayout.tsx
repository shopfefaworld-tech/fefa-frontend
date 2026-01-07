'use client';

import { useEffect } from 'react';
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

  // #region agent log
  useEffect(() => {
    const headerEl = document.querySelector('header');
    const mainEl = document.querySelector('main');
    if (headerEl && mainEl) {
      const headerRect = headerEl.getBoundingClientRect();
      const mainRect = mainEl.getBoundingClientRect();
      const mainStyle = window.getComputedStyle(mainEl);
      fetch('http://127.0.0.1:7242/ingest/7eb6d36f-1ef2-474d-b047-b573307ef79f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainLayout.tsx:useEffect',message:'MainLayout spacing check',data:{headerHeight:headerRect.height,mainTop:mainRect.top,mainPaddingTop:mainStyle.paddingTop,mainMarginTop:mainStyle.marginTop,mainPt:mainEl.classList.contains('pt-') || mainEl.classList.toString().includes('pt-'),scrollY:window.scrollY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
  });
  // #endregion

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
          className="lg:min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300 pt-20 sm:pt-24 md:pt-28 lg:pt-32"
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
