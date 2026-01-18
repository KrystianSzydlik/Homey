import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect all routes in this group - redirect unauthenticated users to login
  if (!session?.user) {
    redirect('/login');
  }

  return children;
}
