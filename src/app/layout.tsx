import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import cn from 'classnames';
import { Inter } from 'next/font/google';
import Link from 'next/link';

import type { Metadata } from 'next';

import { HOME_OG_IMAGE_URL } from '@/lib/constants';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: `SmartCook - Turn Random Ingredients Into Amazing Meals`,
  description: `A smart cooking assistant that helps you create delicious meals from the ingredients you already have, reduce food waste, and simplify meal planning.`,
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className={cn(inter.className, 'relative h-screen')}>
        <ClerkProvider>
          <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full mx-auto border-b border-bianca-200 backdrop-blur-sm bg-white/10">
            <section className="flex items-center justify-between w-full max-w-screen-lg gap-4 p-4">
              <Link
                href="/core"
                className="flex items-center content-center justify-center"
              >
                <img
                  src="/logo_flav.png"
                  alt="Logo"
                  className="w-8 h-8 p-1 rounded-full bg-white-100"
                />
              </Link>
              <div className="flex items-center justify-center">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </section>
          </header>
          <div className="flex flex-col items-center justify-center w-full max-w-screen-lg mx-auto pt-[65px] min-h-screen">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
