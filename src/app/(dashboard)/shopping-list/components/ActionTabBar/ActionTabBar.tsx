'use client';

import TabBar from '@/components/shared/TabBar';
import SearchIcon from '@/components/shared/icons/SearchIcon';
import BoltIcon from '@/components/shared/icons/BoltIcon';
import ScanIcon from '@/components/shared/icons/ScanIcon';
import FilterIcon from '@/components/shared/icons/FilterIcon';

export type ActionTab = 'search' | 'add' | 'scanner' | 'filter';

interface ActionTabBarProps {
  activeTab: ActionTab | null;
  onTabChange: (tab: ActionTab | null) => void;
}

const TABS: { id: ActionTab; label: string; icon: React.ReactNode }[] = [
  { id: 'search', label: 'Szukaj', icon: <SearchIcon size={20} /> },
  { id: 'add', label: 'Dodaj', icon: <BoltIcon size={20} /> },
  { id: 'scanner', label: 'Skaner', icon: <ScanIcon size={20} /> },
  { id: 'filter', label: 'Filtruj', icon: <FilterIcon size={20} /> },
];

export default function ActionTabBar({ activeTab, onTabChange }: ActionTabBarProps) {
  return (
    <TabBar aria-label="Akcje listy zakupów">
      {TABS.map((tab) => (
        <TabBar.Item
          key={tab.id}
          icon={tab.icon}
          label={tab.label}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(activeTab === tab.id ? null : tab.id)}
        />
      ))}
    </TabBar>
  );
}
