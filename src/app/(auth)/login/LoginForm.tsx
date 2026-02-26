'use client';

import dynamic from 'next/dynamic';
import { useActionState, useState, useRef, useId } from 'react';
import { authenticate } from '@/app/lib/actions';
import styles from './login.module.scss';

const LoginScene = dynamic(() => import('@/components/LoginScene'), {
  loading: () => <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-primary)' }} />,
  ssr: false,
});

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();

  const triggerAnimation = () => {
    setIsAnimating(false); // Reset first
    // Force reflow to restart animation
    void buttonRef.current?.offsetWidth;
    setIsAnimating(true);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <main className={styles.main}>
      <LoginScene />
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome home</h1>
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
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? errorId : undefined}
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
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? errorId : undefined}
            />
          </div>
          <button
            ref={buttonRef}
            className={`${styles.button} ${isAnimating ? styles.animating : ''}`}
            aria-disabled={isPending}
            onMouseDown={triggerAnimation}
            onTouchStart={triggerAnimation}
            onAnimationEnd={handleAnimationEnd}
          >
            {isPending ? 'Logging in...' : 'Log in'}
          </button>
          <div
            id={errorId}
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
