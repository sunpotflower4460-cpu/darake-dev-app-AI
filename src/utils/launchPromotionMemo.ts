export type LaunchPromotionMemo = {
  appId: string;
  appName: string;
  snsPost: string;
  lpCopy: string;
  initialAnnouncement: string;
  friendTestRequest: string;
  communityPost: string;
  xPlan: string;
  instagramPlan: string;
  youtubeShortsIdea: string;
  tiktokIdea: string;
  noteBlogIdea: string;
  notes: string;
};

const STORAGE_KEY = 'darake.launchPromotionMemos.v1';

export function buildInitialLaunchPromotionMemo(): LaunchPromotionMemo {
  return {
    appId: `app-${Date.now()}`,
    appName: '',
    snsPost: '',
    lpCopy: '',
    initialAnnouncement: '',
    friendTestRequest: '',
    communityPost: '',
    xPlan: '',
    instagramPlan: '',
    youtubeShortsIdea: '',
    tiktokIdea: '',
    noteBlogIdea: '',
    notes: '',
  };
}

export function loadLaunchPromotionMemos(): LaunchPromotionMemo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LaunchPromotionMemo[];
  } catch {
    return [];
  }
}

export function saveLaunchPromotionMemos(memos: LaunchPromotionMemo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  } catch {
    // ignore
  }
}

export function addLaunchPromotionMemo(
  memos: LaunchPromotionMemo[],
  memo: LaunchPromotionMemo,
): LaunchPromotionMemo[] {
  return [...memos, memo];
}

export function updateLaunchPromotionMemo(
  memos: LaunchPromotionMemo[],
  updated: LaunchPromotionMemo,
): LaunchPromotionMemo[] {
  return memos.map((m) => (m.appId === updated.appId ? updated : m));
}

export function formatLaunchPromotionMemoMarkdown(memo: LaunchPromotionMemo): string {
  return [
    `# Launch Promotionメモ: ${memo.appName || '（未設定）'}`,
    '',
    '## SNS投稿案',
    memo.snsPost || '（未入力）',
    '',
    '## LP文言案',
    memo.lpCopy || '（未入力）',
    '',
    '## 初回告知文',
    memo.initialAnnouncement || '（未入力）',
    '',
    '## 友人テスト依頼文',
    memo.friendTestRequest || '（未入力）',
    '',
    '## コミュニティ投稿案',
    memo.communityPost || '（未入力）',
    '',
    '## X（Twitter）プラン',
    memo.xPlan || '（未入力）',
    '',
    '## Instagram プラン',
    memo.instagramPlan || '（未入力）',
    '',
    '## YouTube Shorts アイデア',
    memo.youtubeShortsIdea || '（未入力）',
    '',
    '## TikTok アイデア',
    memo.tiktokIdea || '（未入力）',
    '',
    '## note / ブログ案',
    memo.noteBlogIdea || '（未入力）',
    '',
    '## ノート',
    memo.notes || '（未入力）',
  ].join('\n');
}
