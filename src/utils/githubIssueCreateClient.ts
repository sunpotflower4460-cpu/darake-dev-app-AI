export type CreateGitHubIssuePayload = {
  repoUrl: string;
  title: string;
  body: string;
  source?: 'pon-start' | 'manual' | 'unknown';
};

export type CreateGitHubIssueResult =
  | {
      ok: true;
      issueUrl: string;
      issueNumber: number;
      owner: string;
      repo: string;
      fullName: string;
    }
  | {
      ok: false;
      error: string;
      code: string;
    };

export async function createGitHubIssue(
  payload: CreateGitHubIssuePayload,
): Promise<CreateGitHubIssueResult> {
  const res = await fetch('/api/github/issues/create', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}
