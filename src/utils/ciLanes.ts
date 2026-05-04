import type { CiWatchItem } from '../services/ciWatchService';

export type CiLane = 'now' | 'later' | 'leave';

export type CiLaneGroup = {
  lane: CiLane;
  title: string;
  lead: string;
  items: CiWatchItem[];
};

function getLane(item: CiWatchItem): CiLane {
  if (item.status === 'blocked' || item.status === 'manual') {
    return 'now';
  }

  if (item.status === 'checking') {
    return 'later';
  }

  return 'leave';
}

export function buildCiLaneGroups(items: CiWatchItem[]): CiLaneGroup[] {
  const groups: CiLaneGroup[] = [
    {
      lane: 'now',
      title: '今やる',
      lead: '失敗・停止・手動確認が必要なCIです。',
      items: [],
    },
    {
      lane: 'later',
      title: '後でいい',
      lead: '実行中なので、少し待ってから見れば大丈夫です。',
      items: [],
    },
    {
      lane: 'leave',
      title: '放っておいていい',
      lead: '成功済み、または今は触らなくてよさそうなCIです。',
      items: [],
    },
  ];

  items.forEach((item) => {
    groups.find((group) => group.lane === getLane(item))?.items.push(item);
  });

  return groups;
}
