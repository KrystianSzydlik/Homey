'use client';
import styles from './DashboardGrid.module.css';
import DashboardCard from '../DashboardCard/DashboardCard';

const cards = [
  {
    id: 'shopping',
    title: 'Shopping List',
    href: '/shopping',
    icon: 'pen',
  },
  {
    id: 'todo',
    title: 'Todo List',
    href: '/todo',
    icon: 'pen',
  },
  {
    id: 'cookbook',
    title: 'Cookbook',
    href: '/cookbook',
    icon: 'book',
  },
  {
    id: 'habits',
    title: 'Habit Tracker',
    href: '/habits',
    icon: 'sun',
  },
];

export function DashboardGrid() {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <DashboardCard key={card.id} {...card} />
      ))}
    </div>
  );
}
