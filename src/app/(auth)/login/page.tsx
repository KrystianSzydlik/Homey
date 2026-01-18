import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await auth();

  // Redirect authenticated users to dashboard (at root)
  if (session?.user) {
    redirect('/');
  }

  return <LoginForm />;
}
