'use client';

import { useMemo } from 'react';
import Image from 'next/image';

const LAUNCH_DATE = new Date('2025-02-13');

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-amber-50/30 dark:from-stone-950 dark:to-amber-950/10 px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="mb-8 flex justify-center">
          <Image
            src="/fefa-shop-banner-biglogo.png"
            alt="fefa"
            width={180}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="font-dancing-script text-4xl sm:text-5xl text-stone-800 dark:text-stone-100 mb-2">
          Something beautiful is coming
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-lg mb-6">
          We&apos;re putting the finishing touches on our new collection.
        </p>
        <div className="inline-block bg-stone-100 dark:bg-stone-800/80 rounded-2xl px-8 py-6 mb-6">
          <p className="text-5xl sm:text-6xl font-semibold text-stone-800 dark:text-stone-100 tabular-nums">
            {daysLeft}
          </p>
          <p className="text-stone-600 dark:text-stone-400 text-sm uppercase tracking-wider mt-1">
            days to launch
          </p>
        </div>
        <p className="text-stone-700 dark:text-stone-300 font-medium">
          See you on <span className="text-amber-700 dark:text-amber-400">{launchLabel}</span>
        </p>
      </div>
    </div>
  );
}
