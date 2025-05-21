import { SignUp } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await currentUser();

  // Redirect to /core if user is already signed in
  if (user) {
    redirect('/core');
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
