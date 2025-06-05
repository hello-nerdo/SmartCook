import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { pathToRecipes } from '@/lib/constants';

// This layout requires authentication
export default async function CoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            SmartCook
          </Link>
          <nav className="space-x-4">
            <Link
              href="/core"
              className="text-charcoal-700 hover:text-orange-600"
            >
              Find Recipes
            </Link>
            <Link
              href={pathToRecipes()}
              className="text-charcoal-700 hover:text-orange-600"
            >
              My Recipes
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
