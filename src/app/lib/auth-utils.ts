'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export interface SessionData {
  householdId: string;
  userId: string;
}

export async function getHouseholdId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect('/login');
  }
  return session.user.householdId;
}

export async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  return session.user.id;
}

export async function getSessionData(): Promise<SessionData> {
  const session = await auth();
  if (!session?.user?.householdId || !session?.user?.id) {
    redirect('/login');
  }
  return {
    householdId: session.user.householdId,
    userId: session.user.id,
  };
}
