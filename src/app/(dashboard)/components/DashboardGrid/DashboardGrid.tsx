import Link from 'next/link';
import styles from './DashboardGrid.module.scss';

const features = [
  {
    title: '🛒 Shopping List',
    description: 'Manage your grocery shopping together',
    href: '/shopping-list',
    color: 'var(--primary)',
  },
  {
    title: '✅ Todo List',
    description: 'Track tasks and get things done',
    href: '/todo',
    color: 'var(--accent)',
  },
  {
    title: '📖 Cookbook',
    description: 'Store and share your favorite recipes',
    href: '/cookbook',
    color: '#F59E0B',
  },
  {
    title: '🌟 Habit Tracker',
    description: 'Build better habits together',
    href: '/habits',
    color: '#10B981',
  },
];

export default function DashboardGrid() {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={styles.card}
            style={{ '--card-color': feature.color } as React.CSSProperties}
          >
            <h2 className={styles.title}>{feature.title}</h2>
            <p className={styles.description}>{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
