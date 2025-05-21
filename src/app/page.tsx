/* eslint-disable @next/next/no-img-element */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import { LOGIN_REDIRECT_URL } from '@/lib/constants';

export default function Home() {


  return (
    <AnimatePresence>
      <div
        key="main-container"
        className="w-screen min-h-max overflow-y-scroll snap-mandatory snap-y bg-gradient-to-b from-paper-300 via-paper-500 to-mustard-50/50 sm:mt-[-65px]"
      >
        {/* Hero section - focused on pain points */}
        <section className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 md:snap-center sm:px-4 md:px-20 sm:py-0">
          <div className="flex flex-col items-center justify-center gap-4 mt-8 lg:flex-row lg:gap-16 sm:mt-0">
            {/* Text Content */}
            <div className="flex flex-col items-center max-w-2xl text-center lg:items-start lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-7xl lg:text-8xl text-bianca-900"
              >
                Turn Random Ingredients Into Amazing Meals
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-xl px-2 mt-4 mb-8 text-base sm:mt-6 sm:text-lg text-bianca-800 sm:px-0"
              >
                <ul className="pl-5 space-y-2 text-left list-disc">
                  {[
                    'Stuck with random ingredients?',
                    'Tired of food waste?',
                    'Need meal planning help?',
                  ].map((text, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="text-base font-medium sm:text-lg"
                    >
                      {text}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="relative flex flex-col gap-2"
              >
                <Link
                  href={LOGIN_REDIRECT_URL}
                  className="flex items-center max-w-sm gap-2 px-8 py-3 text-base font-semibold transition-colors rounded-full sm:py-4 bg-mustard-500 text-bianca-900 sm:text-lg hover:bg-mustard-600"
                >
                  <span>Start Cooking Smarter</span>
                  <div className="px-2 py-1 text-xs font-medium text-center text-white rounded-full bg-leaf-700 max-w-min whitespace-nowrap">
                    First month free
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </AnimatePresence>
  );
}
