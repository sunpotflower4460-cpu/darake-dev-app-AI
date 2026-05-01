export type ServiceMode = 'mock' | 'ready_for_real_later';

export type ConnectionStatus = {
  label: string;
  mode: ServiceMode;
  isActive: boolean;
  description: string;
  nextStep: string;
};

export type DevServiceSnapshot = {
  repository: ConnectionStatus;
  workItems: ConnectionStatus;
  reviewChecks: ConnectionStatus;
  screenshots: ConnectionStatus;
  submission: ConnectionStatus;
};

export function getDevServiceSnapshot(): DevServiceSnapshot {
  return {
    repository: {
      label: 'リポジトリ情報',
      mode: 'mock',
      isActive: false,
      description: '今は仮データで表示しています。',
      nextStep: '読み取り専用の情報表示から始めます。',
    },
    workItems: {
      label: '作業依頼',
      mode: 'mock',
      isActive: false,
      description: '今は画面上の予定として表示しています。',
      nextStep: '将来はIssue下書きやPR状況へつなぎます。',
    },
    reviewChecks: {
      label: '確認ゲート',
      mode: 'mock',
      isActive: false,
      description: '今は仮の確認結果を表示しています。',
      nextStep: 'CI結果と差分要約の表示へ進みます。',
    },
    screenshots: {
      label: 'スクショ確認',
      mode: 'mock',
      isActive: false,
      description: '今は取得予定だけを表示しています。',
      nextStep: '後で自動取得と比較欄を追加します。',
    },
    submission: {
      label: '提出準備',
      mode: 'mock',
      isActive: false,
      description: '今はフォーム項目だけを整理しています。',
      nextStep: '提出前チェックリストを増やします。',
    },
  };
}
