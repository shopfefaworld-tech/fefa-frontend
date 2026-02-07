'use client';

import { useMemo } from 'react';

const LAUNCH_DATE = new Date('2026-02-13');

function getDaysUntilLaunch(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const launch = new Date(LAUNCH_DATE);
  launch.setHours(0, 0, 0, 0);
  const diff = launch.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getLaunchLabel(): string {
  return LAUNCH_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ComingSoon() {
  const daysLeft = useMemo(getDaysUntilLaunch, []);
  const launchLabel = useMemo(getLaunchLabel, []);

  return (
    <div
      className="relative min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/Fefa-shop-banner.png)' }}
    >
      {/* Subtle overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative flex flex-col min-h-screen">
        {/* Main message — centered, minimal */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-dancing-script text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-md max-w-xl">
            Something beautiful is coming
          </h1>
          <p className="mt-4 text-white/90 text-lg sm:text-xl">
            See you on {launchLabel}
          </p>
        </main>
        {/* Timer — bottom bar, simple and out of the way */}
        <footer className="relative py-5 px-6 flex items-center justify-center gap-6 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <span className="text-white/90 text-sm uppercase tracking-widest">
            Launching in
          </span>
          <span className="text-2xl sm:text-3xl font-light text-white tabular-nums">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
          </span>
        </footer>
      </div>
    </div>
  );
}
