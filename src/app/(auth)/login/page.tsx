'use client';

import { useActionState, useState, useRef } from 'react';
import { authenticate } from '@/app/lib/actions';
import styles from './login.module.scss';
import LoginScene from '@/components/LoginScene';

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
