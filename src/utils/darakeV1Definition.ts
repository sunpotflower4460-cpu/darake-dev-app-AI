export type DarakeV1RequirementStatus = 'done' | 'needs-review' | 'blocked';

export type DarakeV1Requirement = {
  id: string;
  label: string;
  status: DarakeV1RequirementStatus;
  required: boolean;
  reason: string;
};

export const DARAKE_V1_REQUIREMENTS: DarakeV1Requirement[] = [
  {
    id: 'final-form-ui',
    label: 'Final Form UIがある',
    status: 'done',
    required: true,
    reason: '管制室の主役。最も重要な画面。',
  },
  {
    id: 'sleep-mode',
    label: 'Sleep Modeがある',
    status: 'done',
    required: true,
    reason: '人間が寝ている間もシステムが動くことを示す。',
  },
  {
    id: 'morning-report',
    label: 'Morning Reportがある',
    status: 'done',
    required: true,
    reason: '朝1回だけ確認すればいい仕組みを提供する。',
  },
  {
    id: 'review-inbox',
    label: 'Review Inboxがある',
    status: 'done',
    required: true,
    reason: 'すぐ判断できない項目を貯めておく場所。',
  },
  {
    id: 'completion-first-dashboard',
    label: 'Completion-first Dashboardがある',
    status: 'done',
    required: true,
    reason: '完成が最初に見える。進捗より完成優先。',
  },
  {
    id: 'one-screen',
    label: 'One Screen表示がある',
    status: 'done',
    required: true,
    reason: 'スマホで1画面で済む。',
  },
  {
    id: 'friction-audit',
    label: 'Friction Auditがある',
    status: 'done',
    required: true,
    reason: '人間の手間を検出・削減できる。',
  },
  {
    id: 'safety-audit',
    label: 'Safety Auditがある',
    status: 'done',
    required: true,
    reason: '危険な操作を自動化しない。',
  },
  {
    id: 'panel-registry',
    label: 'Panel Registryがある',
    status: 'done',
    required: true,
    reason: 'パネルの一元管理。追加・削除が容易。',
  },
  {
    id: 'blocked-never-hidden',
    label: 'blockedが隠れない',
    status: 'done',
    required: true,
    reason: '最も重要な情報が常に見える。',
  },
  {
    id: 'no-secret-save',
    label: 'secretを保存しない',
    status: 'done',
    required: true,
    reason: 'セキュリティ上、APIキー・トークンは保存しない。',
  },
  {
    id: 'no-external-api',
    label: '外部APIを呼ばない',
    status: 'done',
    required: true,
    reason: 'v1は内部利用のみ。外部実行なし。',
  },
  {
    id: 'mobile-readable',
    label: 'スマホで読める',
    status: 'done',
    required: true,
    reason: 'スマホファースト。PCに依存しない。',
  },
  {
    id: 'not-info-overload',
    label: '情報過多でない',
    status: 'needs-review',
    required: true,
    reason: '通常時に見る情報が最小限。',
  },
  {
    id: 'details-hidden-by-default',
    label: '通常時に詳細を見なくてよい',
    status: 'needs-review',
    required: true,
    reason: '詳細はアコーディオン / 折りたたみ。コピーボタンが前面。',
  },
];

export function getDarakeV1Requirements(): DarakeV1Requirement[] {
  return DARAKE_V1_REQUIREMENTS;
}

export function getDarakeV1RequirementById(id: string): DarakeV1Requirement | undefined {
  return DARAKE_V1_REQUIREMENTS.find((r) => r.id === id);
}
