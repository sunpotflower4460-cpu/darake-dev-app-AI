import type { WatchItem } from '../data/reviewWatch';

export type ReviewLane = 'now' | 'later' | 'leave';

export type ReviewLaneGroup = {
  lane: ReviewLane;
  title: string;
  lead: string;
  items: WatchItem[];
};

function getLane(item: WatchItem): ReviewLane {
  if (item.status === 'blocked' || item.status === 'manual') {
    return 'now';
  }

  if (item.status === 'checking') {
    return 'later';
  }

  return 'leave';
}

export function buildReviewLaneGroups(items: WatchItem[]): ReviewLaneGroup[] {
  const groups: ReviewLaneGroup[] = [
    {
      lane: 'now',
      title: '今やる',
      lead: '止まっているか、人間判断が必要な所です。',
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
      lead: '成功しているので、今は見なくて大丈夫です。',
      items: [],
    },
  ];

  items.forEach((item) => {
    groups.find((group) => group.lane === getLane(item))?.items.push(item);
  });

  return groups;
}
