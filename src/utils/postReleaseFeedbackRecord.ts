export type FeedbackSource =
  | 'self-review'
  | 'user-message'
  | 'store-review'
  | 'testflight'
  | 'sns'
  | 'friend'
  | 'other';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export type PostReleaseFeedback = {
  id: string;
  appId: string;
  source: FeedbackSource;
  priority: FeedbackPriority;
  title: string;
  body: string;
  category:
    | 'bug'
    | 'ui'
    | 'copy'
    | 'performance'
    | 'feature-request'
    | 'store-page'
    | 'crash'
    | 'other';
  status: 'new' | 'triaged' | 'issue-drafted' | 'fixed' | 'ignored';
  createdAt: string;
};

const STORAGE_KEY = 'darake.postReleaseFeedback.v1';

export function buildInitialFeedback(appId: string = ''): PostReleaseFeedback {
  return {
    id: `feedback-${Date.now()}`,
    appId,
    source: 'self-review',
    priority: 'medium',
    title: '',
    body: '',
    category: 'bug',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
}

export function loadFeedbacks(): PostReleaseFeedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PostReleaseFeedback[];
  } catch {
    return [];
  }
}

export function saveFeedbacks(feedbacks: PostReleaseFeedback[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
  } catch {
    // ignore
  }
}

export function addFeedback(list: PostReleaseFeedback[], item: PostReleaseFeedback): PostReleaseFeedback[] {
  return [...list, item];
}

export function updateFeedback(list: PostReleaseFeedback[], updated: PostReleaseFeedback): PostReleaseFeedback[] {
  return list.map((f) => (f.id === updated.id ? updated : f));
}

export function formatFeedbackMarkdown(f: PostReleaseFeedback): string {
  return [
    `## フィードバック: ${f.title || '（タイトルなし）'}`,
    '',
    `- **id**: ${f.id}`,
    `- **appId**: ${f.appId || '（未設定）'}`,
    `- **source**: ${f.source}`,
    `- **priority**: ${f.priority}`,
    `- **category**: ${f.category}`,
    `- **status**: ${f.status}`,
    `- **createdAt**: ${f.createdAt}`,
    '',
    f.body || '（内容なし）',
  ].join('\n');
}
