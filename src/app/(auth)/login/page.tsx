'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import styles from './login.module.scss';

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome back</h1>
        <form action={formAction} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              className={styles.input}
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              className={styles.input}
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>
          <button className={styles.button} aria-disabled={isPending}>
            {isPending ? 'Logging in...' : 'Log in'}
          </button>
          <div
            className={styles.error}
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && <p>{errorMessage}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
