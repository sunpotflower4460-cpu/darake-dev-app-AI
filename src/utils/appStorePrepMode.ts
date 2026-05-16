export type AppStorePrepItem = {
  id: string;
  label: string;
  hint: string;
  required: boolean;
  humanMustCheck: boolean;
};

export const APP_STORE_PREP_ITEMS: AppStorePrepItem[] = [
  { id: 'app-name', label: 'アプリ名', hint: '30文字以内、他アプリと被らないか', required: true, humanMustCheck: true },
  { id: 'subtitle', label: 'サブタイトル', hint: '30文字以内でアプリを補足する文', required: false, humanMustCheck: false },
  { id: 'description', label: '説明文', hint: '4000文字以内、最初の3行が特に重要', required: true, humanMustCheck: true },
  { id: 'privacy-policy', label: 'プライバシーポリシー URL', hint: '公開URLが必要。ユーザーデータの扱いを記載', required: true, humanMustCheck: true },
  { id: 'terms', label: '利用規約 URL', hint: '任意だが有料アプリは必須', required: false, humanMustCheck: false },
  { id: 'monetization', label: '課金の有無', hint: 'IAP / サブスクがあればApple Payの設定が必要', required: true, humanMustCheck: true },
  { id: 'age-rating', label: '年齢制限', hint: 'コンテンツに合わせて4+〜17+を選ぶ', required: true, humanMustCheck: false },
  { id: 'data-storage', label: 'データ保存の説明', hint: 'ローカル / クラウド どちらに保存するか', required: true, humanMustCheck: true },
  { id: 'login', label: 'ログインの有無', hint: 'Sign in with Appleが必要かどうか', required: true, humanMustCheck: true },
  { id: 'screenshots', label: 'スクリーンショット', hint: '6.7インチ, 6.5インチ, iPad 各サイズ', required: true, humanMustCheck: true },
  { id: 'review-notes', label: '審査メモ', hint: '特殊機能の使い方, テストアカウント情報など', required: false, humanMustCheck: false },
  { id: 'demo-account', label: 'デモアカウント', hint: 'ログインが必要な場合はテスト用アカウントが必要', required: false, humanMustCheck: false },
];

const STORAGE_KEY = 'darake.appStorePrepMode.v1';

export type AppStorePrepState = {
  checkedIds: string[];
  appName: string;
  updatedAt: string;
};

export function loadAppStorePrepState(): AppStorePrepState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppStorePrepState;
  } catch {
    return null;
  }
}

export function saveAppStorePrepState(state: AppStorePrepState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function buildAppStorePrepReadiness(checkedIds: string[]): {
  percent: number;
  requiredDone: number;
  requiredTotal: number;
  humanCheckDone: number;
  humanCheckTotal: number;
  readyForSubmit: boolean;
} {
  const required = APP_STORE_PREP_ITEMS.filter((i) => i.required);
  const humanCheck = APP_STORE_PREP_ITEMS.filter((i) => i.humanMustCheck);
  const requiredDone = required.filter((i) => checkedIds.includes(i.id)).length;
  const humanCheckDone = humanCheck.filter((i) => checkedIds.includes(i.id)).length;

  return {
    percent: Math.round((checkedIds.length / APP_STORE_PREP_ITEMS.length) * 100),
    requiredDone,
    requiredTotal: required.length,
    humanCheckDone,
    humanCheckTotal: humanCheck.length,
    readyForSubmit: requiredDone === required.length && humanCheckDone === humanCheck.length,
  };
}
