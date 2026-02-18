import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/shared/Header';
import styles from './layout.module.scss';

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
    <div className={styles.wrapper}>
      <Header avatarFallback={avatarFallback} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
