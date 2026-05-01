export type DarakeLane = 'now' | 'later' | 'leave';

export type DarakeTask = {
  id: string;
  lane: DarakeLane;
  title: string;
  reason: string;
  energy: 'low' | 'medium' | 'high';
};

export const darakeTasks: DarakeTask[] = [
  {
    id: 'check-freshness',
    lane: 'now',
    title: '状態が古い時だけ確認する',
    reason: '新しい時は見なくていい。古い時だけ軽く見る。',
    energy: 'low',
  },
  {
    id: 'review-high-risk',
    lane: 'now',
    title: '危険度が高い変更だけ止める',
    reason: '全部を見張るより、大事なところだけ守る。',
    energy: 'medium',
  },
  {
    id: 'polish-copy',
    lane: 'later',
    title: '文言の細かい磨き込み',
    reason: '今すぐ完璧にしなくても価値は減らない。',
    energy: 'low',
  },
  {
    id: 'visual-upgrade',
    lane: 'later',
    title: '見た目の追加演出',
    reason: '土台が育ってから、ゆっくり美しくできる。',
    energy: 'medium',
  },
  {
    id: 'watch-everything',
    lane: 'leave',
    title: '全部を毎回確認する',
    reason: 'それは疲れる。アプリに任せていい。',
    energy: 'high',
  },
  {
    id: 'manual-repetition',
    lane: 'leave',
    title: '同じ確認を手作業で繰り返す',
    reason: '繰り返し作業こそ自動化の畑。',
    energy: 'high',
  },
];

export const darakePrinciples = [
  '全部を頑張らない',
  '古い時だけ見る',
  '危険な時だけ止まる',
  '楽しいところに力を残す',
];
