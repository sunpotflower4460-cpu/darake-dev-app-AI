export type SetupStatusResponse = {
  ok: true;
  githubToken: 'set' | 'missing';
  githubIssueCreateEnabled: boolean;
  githubAgentAssignEnabled: boolean;
  githubPrMergeEnabled: boolean;
  allowedReposConfigured: boolean;
  runRegistryEnabled: boolean;
  runRegistryKvBound: boolean;
  autopilotScheduleEnabled: boolean;
  telegramConfigured: boolean;
  webhookConfigured: boolean;
};

export async function fetchSetupStatus(): Promise<SetupStatusResponse> {
  const res = await fetch('/api/darake/setup/status');
  if (!res.ok) throw new Error('setup status fetch failed');
  const data = await res.json() as SetupStatusResponse;
  if (!data.ok) throw new Error('setup status response not ok');
  return data;
}
