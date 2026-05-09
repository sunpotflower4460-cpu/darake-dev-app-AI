export type SettingsHealthLevel = 'ok' | 'missing' | 'warning' | 'blocked';

export type SettingsHealthItem = {
  id: string;
  title: string;
  level: SettingsHealthLevel;
  description: string;
  nextActionLabel?: string;
  docsUrl?: string;
};

export type SettingsHealthSummary = {
  overall: 'ready' | 'mostly-ready' | 'needs-setup' | 'blocked';
  items: SettingsHealthItem[];
  readyCount: number;
  missingCount: number;
  blockedCount: number;
  updatedAt: string;
};

export type SettingsHealthResponse = {
  ok: true;
  github: {
    tokenConfigured: boolean;
    repoAllowlistConfigured: boolean;
    issueCreateEnabled: boolean;
    mergeEnabled: boolean;
  };
  kv: {
    configured: boolean;
    runRegistryEnabled: boolean;
  };
  notifications: {
    telegramConfigured: boolean;
    webhookConfigured: boolean;
  };
  cron: {
    scheduleEnabled: boolean;
  };
};
