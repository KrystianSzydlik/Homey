import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    householdId: string;
  }

  interface Session {
    user: User & DefaultSession['user'];
  }
}
