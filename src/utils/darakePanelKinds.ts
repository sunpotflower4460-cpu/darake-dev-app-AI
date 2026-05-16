export type PanelKind = 'real-data' | 'demo' | 'manual-note' | 'developer';

export type PanelKindInfo = {
  label: string;
  color: string;
  bg: string;
};

export const PANEL_KIND_INFO: Record<PanelKind, PanelKindInfo> = {
  'real-data': { label: '実データ', color: '#065f46', bg: '#d1fae5' },
  demo:        { label: 'デモ',     color: '#1e40af', bg: '#dbeafe' },
  'manual-note': { label: '手動メモ', color: '#78350f', bg: '#fef3c7' },
  developer:   { label: '開発者向け', color: '#4b5563', bg: '#f3f4f6' },
};
