import type { PrWatchItem } from '../services/prWatchService';

export type PrLane = 'now' | 'later' | 'leave';

export type PrLaneGroup = {
  lane: PrLane;
  title: string;
  lead: string;
  items: PrWatchItem[];
};

function getLane(item: PrWatchItem): PrLane {
  if (item.status === 'blocked' || item.status === 'manual') {
    return 'now';
  }

  if (item.status === 'checking') {
    return 'later';
  }

  return 'leave';
}

export function buildPrLaneGroups(items: PrWatchItem[]): PrLaneGroup[] {
  const groups: PrLaneGroup[] = [
    {
      lane: 'now',
      title: '今やる',
      lead: '止まっているか、人間判断が必要なPRです。',
      items: [],
    },
    {
      lane: 'later',
      title: '後でいい',
      lead: '進行中なので、少し待ってから見れば大丈夫です。',
      items: [],
    },
    {
      lane: 'leave',
      title: '放っておいていい',
      lead: '今は触らなくてよさそうなPRです。',
      items: [],
    },
  ];

  items.forEach((item) => {
    groups.find((group) => group.lane === getLane(item))?.items.push(item);
  });

  return groups;
}
