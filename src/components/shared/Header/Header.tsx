'use client';

import Link from 'next/link';
import HomeIcon from '../icons/HomeIcon';
import styles from './Header.module.scss';

interface HeaderProps {
  avatarFallback?: string;
}

export default function Header({ avatarFallback = 'U' }: HeaderProps) {
  return (
    <header className={styles.header}>
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
