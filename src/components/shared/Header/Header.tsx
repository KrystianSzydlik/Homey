'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import HomeIcon from '../icons/HomeIcon';
import styles from './Header.module.scss';

interface HeaderProps {
  avatarFallback?: string;
}

export default function Header({ avatarFallback = 'U' }: HeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    if (!mediaQuery.matches) {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (Math.abs(delta) < 10) return;

      if (delta > 0 && currentScrollY > 64) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setIsHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <header className={`${styles.header} ${isHidden ? styles.hidden : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.homeButton}>
          <HomeIcon size={20} />
          <span>Home</span>
        </Link>

        <div className={styles.avatar} aria-label="User avatar">
          {avatarFallback}
        </div>
      </div>
    </header>
  );
}
