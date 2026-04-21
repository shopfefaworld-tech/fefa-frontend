'use client';

import { FaWhatsapp } from 'react-icons/fa';

const whatsappNumber = '919992224842';
const whatsappMessage = encodeURIComponent(
  "Hi FEFA team, I want to shop through WhatsApp while the website is under maintenance."
);
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

export default function ComingSoon() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/Fefa-shop-banner.png)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f0016]/80 via-[#3a0a2a]/72 to-[#210216]/84" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(219,192,120,0.16),transparent_35%)]" aria-hidden />

      <main className="relative min-h-screen flex items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[#e4cb91]/35 bg-[#25061bcc]/90 backdrop-blur-md shadow-[0_26px_90px_rgba(0,0,0,0.42)] p-6 sm:p-10 text-center text-white">
          <p className="inline-flex items-center rounded-full border border-[#e4cb91]/60 bg-[#4e1436]/50 px-4 py-1.5 text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-[#f3dfb2]">
            FEFA Maintenance Update
          </p>

          <h1 className="mt-5 !font-cormorant text-4xl leading-tight sm:text-5xl md:text-6xl text-[#fff7ea]">
            Website Under Maintenance
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed text-[#f6ead5]/90 max-w-xl mx-auto">
            We are refreshing your FEFA experience. While the website is being updated, continue shopping directly on WhatsApp with our team.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-3.5 sm:px-7 text-base sm:text-lg font-semibold text-white shadow-[0_14px_42px_rgba(37,211,102,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1dbb58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d0920]"
          >
            <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            Continue Shopping on WhatsApp
          </a>

          <p className="mt-5 text-xs sm:text-sm text-[#e9d7b1]/85 tracking-wide">
            Tap the button to get redirected instantly.
          </p>
        </section>
      </main>
    </div>
  );
}
