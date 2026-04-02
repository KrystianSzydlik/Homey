'use client';

import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import styles from './TabBar.module.scss';

interface TabBarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function TabBarItem({ icon, label, isActive = false, onClick }: TabBarItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={clsx(styles.tab, isActive && styles.active)}
      onClick={onClick}
    >
      <span className={styles.tabIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.tabLabel}>{label}</span>
    </button>
  );
}

interface TabBarProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

function TabBar({
  children,
  className,
  'aria-label': ariaLabel = 'Akcje',
}: TabBarProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!tabs?.length) return;

    const tabArray = Array.from(tabs);
    const currentIndex = tabArray.findIndex((tab) => tab === document.activeElement);

    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabArray.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabArray.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    tabArray[nextIndex].focus();
  }, []);

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(styles.tabBar, className)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

TabBar.Item = TabBarItem;

export default TabBar;
