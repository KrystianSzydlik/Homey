'use client';

import Link from 'next/link';
import styles from './SkipLink.module.scss';

export default function SkipLink() {
  return (
    <Link href="#main-content" className={styles.skipLink}>
      Skip to main content
    </Link>
  );
}
