export type PostMergeStatus =
  | 'idle'
  | 'waiting-deploy'
  | 'deploy-success'
  | 'deploy-failed'
  | 'preview-checking'
  | 'preview-ok'
  | 'preview-broken'
  | 'needs-human';

export type PostMergeWatchState = {
  status: PostMergeStatus;
  prUrl?: string;
  prNumber?: number;
  repoUrl?: string;
  mergedAt?: string;
  deployUrl?: string;
  userMessage: string;
  nextActionLabel: string;
  updatedAt: string;
};

const STORAGE_KEY = 'darake.postMergeWatch.v1';

const INITIAL_STATE: Omit<PostMergeWatchState, 'updatedAt'> = {
  status: 'idle',
  userMessage: 'マージ後の状態を監視します',
  nextActionLabel: '何もしなくてOK',
};

export function loadPostMergeWatchState(): PostMergeWatchState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PostMergeWatchState;
  } catch {
    return null;
  }
}

export function savePostMergeWatchState(
  state: Omit<PostMergeWatchState, 'updatedAt'>,
): PostMergeWatchState {
  const full: PostMergeWatchState = { ...state, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    // ignore
  }
  return full;
}

export function startPostMergeWatch(params: {
  prUrl?: string;
  prNumber?: number;
  repoUrl?: string;
}): PostMergeWatchState {
  return savePostMergeWatchState({
    ...INITIAL_STATE,
    status: 'waiting-deploy',
    prUrl: params.prUrl,
    prNumber: params.prNumber,
    repoUrl: params.repoUrl,
    mergedAt: new Date().toISOString(),
    userMessage: 'デプロイを確認しています...',
    nextActionLabel: '何もしなくてOK',
  });
}

export function resetPostMergeWatchState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
