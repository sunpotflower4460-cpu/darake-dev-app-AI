const REPOSITORY_FULL_NAME = 'sunpotflower4460-cpu/darake-dev-app-AI';

export function buildGitHubIssueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body });
  return `https://github.com/${REPOSITORY_FULL_NAME}/issues/new?${params.toString()}`;
}
