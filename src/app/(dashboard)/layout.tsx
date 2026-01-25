import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/shared/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const avatarFallback = session.user.name?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <Header avatarFallback={avatarFallback} />
      <main>{children}</main>
    </>
  );
}
