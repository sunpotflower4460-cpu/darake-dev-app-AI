// Phase 38.3: Details Visibility Policy

export type DetailsVisibilityReason =
  | 'blocked'
  | 'urgent'
  | 'human-required'
  | 'user-opened'
  | 'default-visible'
  | 'success-hidden'
  | 'report-only-hidden'
  | 'copy-only-hidden'
  | 'optional-hidden'
  | 'low-warning-hidden'
  | 'batched-hidden'
  | 'auto-completed-hidden';

export type DetailsVisibilityDecision = {
  panelId: string;
  visible: boolean;
  reason: DetailsVisibilityReason;
  whenToShow: string;
};

export function computeDetailsVisibility(
  panelId: string,
  tags: string[],
  isUserOpened: boolean
): DetailsVisibilityDecision {
  if (isUserOpened) {
    return {
      panelId,
      visible: true,
      reason: 'user-opened',
      whenToShow: 'ユーザーが明示的に開いた時',
    };
  }

  if (tags.includes('blocked')) {
    return {
      panelId,
      visible: true,
      reason: 'blocked',
      whenToShow: '常に表示（blockedのため）',
    };
  }

  if (tags.includes('urgent')) {
    return {
      panelId,
      visible: true,
      reason: 'urgent',
      whenToShow: '常に表示（urgentのため）',
    };
  }

  if (tags.includes('manual-gate') || tags.includes('human-required')) {
    return {
      panelId,
      visible: true,
      reason: 'human-required',
      whenToShow: '人間の確認が必要な時',
    };
  }

  // Hidden cases
  if (tags.includes('success') || tags.includes('done') || tags.includes('completion')) {
    return {
      panelId,
      visible: false,
      reason: 'success-hidden',
      whenToShow: '「詳細を見る」ボタンを押した時',
    };
  }

  if (tags.includes('report-only') || tags.includes('reports')) {
    return {
      panelId,
      visible: false,
      reason: 'report-only-hidden',
      whenToShow: 'Reportsタブを開いた時',
    };
  }

  if (tags.includes('copy-only') || tags.includes('draft')) {
    return {
      panelId,
      visible: false,
      reason: 'copy-only-hidden',
      whenToShow: 'コピー操作が必要な時だけ開く',
    };
  }

  if (tags.includes('optional')) {
    return {
      panelId,
      visible: false,
      reason: 'optional-hidden',
      whenToShow: '必要な時だけ開く',
    };
  }

  if (tags.includes('warning') && !tags.includes('urgent')) {
    return {
      panelId,
      visible: false,
      reason: 'low-warning-hidden',
      whenToShow: 'Warning Batchを開いた時',
    };
  }

  if (tags.includes('batched') || tags.includes('auto-batched')) {
    return {
      panelId,
      visible: false,
      reason: 'batched-hidden',
      whenToShow: 'Batchパネルを開いた時',
    };
  }

  if (tags.includes('auto-completed') || tags.includes('auto-progressable')) {
    return {
      panelId,
      visible: false,
      reason: 'auto-completed-hidden',
      whenToShow: '自動完了サマリーで確認できます',
    };
  }

  // Default: visible
  return {
    panelId,
    visible: true,
    reason: 'default-visible' as const,
    whenToShow: '常に表示',
  };
}

export function summarizeDetailsVisibilityDecisions(
  decisions: DetailsVisibilityDecision[]
): string {
  const visible = decisions.filter((d) => d.visible).length;
  const hidden = decisions.filter((d) => !d.visible).length;
  return `表示: ${visible}件 / 非表示: ${hidden}件`;
}
