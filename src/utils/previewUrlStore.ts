export type PreviewViewport = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export type PreviewTargetPage = {
  id: string;
  label: string;
  path: string;
  note: string;
};

export type PreviewUrlRecord = {
  previewUrl: string;
  localUrl: string;
  targetPages: PreviewTargetPage[];
  viewports: PreviewViewport[];
  savedAt?: string;
};

const KEY = 'darake.previewUrlRecord.v1';

export const defaultPreviewUrlRecord: PreviewUrlRecord = {
  previewUrl: '',
  localUrl: 'http://localhost:5173',
  targetPages: [
    {
      id: 'home',
      label: 'Home / 管制室トップ',
      path: '/',
      note: 'まず真っ白画面でないこと、主要パネルが見えることを確認します。',
    },
    {
      id: 'auto-run',
      label: 'Auto Run Plan周辺',
      path: '/',
      note: 'Phase 8〜9の自動進行パネル群が読めることを確認します。',
    },
  ],
  viewports: [
    {
      id: 'mobile',
      label: 'スマホ幅',
      width: 390,
      height: 844,
    },
    {
      id: 'desktop',
      label: 'PC幅',
      width: 1440,
      height: 1000,
    },
  ],
};

function normalizeRecord(value: Partial<PreviewUrlRecord>): PreviewUrlRecord {
  return {
    ...defaultPreviewUrlRecord,
    ...value,
    targetPages: Array.isArray(value.targetPages) && value.targetPages.length > 0
      ? value.targetPages
      : defaultPreviewUrlRecord.targetPages,
    viewports: Array.isArray(value.viewports) && value.viewports.length > 0
      ? value.viewports
      : defaultPreviewUrlRecord.viewports,
  };
}

export function loadPreviewUrlRecord(): PreviewUrlRecord {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalizeRecord(JSON.parse(raw)) : defaultPreviewUrlRecord;
  } catch {
    return defaultPreviewUrlRecord;
  }
}

export function savePreviewUrlRecord(record: PreviewUrlRecord): PreviewUrlRecord {
  const next = {
    ...record,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return next;
  }

  return next;
}

export function clearPreviewUrlRecord(): PreviewUrlRecord {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return defaultPreviewUrlRecord;
  }

  return defaultPreviewUrlRecord;
}

export function buildPreviewUrlSummary(record: PreviewUrlRecord): string[] {
  const urlStatus = record.previewUrl.trim() ? 'Preview URLあり' : 'Preview URL未入力';
  const localStatus = record.localUrl.trim() ? 'Local URLあり' : 'Local URL未入力';

  return [
    urlStatus,
    localStatus,
    `target pages: ${record.targetPages.length}`,
    `viewports: ${record.viewports.length}`,
    'Phase 10.1では記録のみ。スクショ生成はまだ実行しません。',
  ];
}

export function formatPreviewUrlRecord(record: PreviewUrlRecord): string {
  return [
    '# Preview URL Record',
    '',
    `previewUrl: ${record.previewUrl || '未入力'}`,
    `localUrl: ${record.localUrl || '未入力'}`,
    `savedAt: ${record.savedAt || '未保存'}`,
    '',
    '## Target Pages',
    ...record.targetPages.map((page) => `- ${page.label}: ${page.path} / ${page.note}`),
    '',
    '## Viewports',
    ...record.viewports.map((viewport) => `- ${viewport.label}: ${viewport.width}x${viewport.height}`),
    '',
    '## Safety Notes',
    '- この段階ではスクショ生成を実行しません。',
    '- 外部URLを保存するだけです。',
    '- secret / token / key は入力しません。',
  ].join('\n');
}
