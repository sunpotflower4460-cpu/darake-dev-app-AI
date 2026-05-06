import { useState } from 'react';
import { NAV_GROUPS } from '../utils/navigationGroups';
import type { DarakeNavGroupId } from '../utils/navigationGroups';

type Props = {
  activeGroup: DarakeNavGroupId | 'all';
  onSelect: (group: DarakeNavGroupId | 'all') => void;
};

export function DarakeNavigationBar({ activeGroup, onSelect }: Props) {
  const [savedGroup, setSavedGroup] = useState<DarakeNavGroupId | 'all'>(activeGroup);

  function handleSelect(id: DarakeNavGroupId | 'all') {
    onSelect(id);
    setSavedGroup(id);
    try {
      localStorage.setItem('darake.navGroup.v1', id);
    } catch {
      // ignore
    }
  }

  return (
    <nav className="darakeNavBar" aria-label="Darake Navigation">
      <button
        type="button"
        className={`darakeNavBtn${activeGroup === 'all' ? ' active' : ''}`}
        onClick={() => handleSelect('all')}
      >
        🌐 全表示
      </button>
      {NAV_GROUPS.map((group) => (
        <button
          key={group.id}
          type="button"
          className={`darakeNavBtn${activeGroup === group.id ? ' active' : ''}`}
          onClick={() => handleSelect(group.id)}
          title={group.description}
        >
          {group.emoji} {group.label}
        </button>
      ))}
    </nav>
  );
}
