export type AssignAgentRequest = {
  repoUrl: string;
  issueNumber: number;
  agent: 'copilot';
};

export type AssignAgentResponse =
  | {
      ok: true;
      issueUrl: string;
      status: 'assigned';
    }
  | {
      ok: false;
      code:
        | 'DISABLED'
        | 'MISSING_TOKEN'
        | 'REPO_NOT_ALLOWED'
        | 'GITHUB_ERROR'
        | 'UNSUPPORTED'
        | 'UNKNOWN_ERROR';
      error: string;
    };

export async function assignAgentToIssue(
  payload: AssignAgentRequest,
): Promise<AssignAgentResponse> {
  const res = await fetch('/api/github/issues/assign-agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export type FindPrByIssueRequest = {
  repoUrl: string;
  issueNumber: number;
};

export type PrCandidate = {
  prUrl: string;
  prNumber: number;
  title: string;
};

export type FindPrByIssueResponse =
  | { ok: true; status: 'found'; prUrl: string; prNumber: number }
  | { ok: true; status: 'not-found' }
  | { ok: true; status: 'multiple-candidates'; candidates: PrCandidate[] }
  | { ok: false; error: string; code: string };

export async function findPrByIssue(
  payload: FindPrByIssueRequest,
): Promise<FindPrByIssueResponse> {
  const res = await fetch('/api/github/prs/find-by-issue', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export type GetPrHealthRequest = {
  repoUrl: string;
  prNumber: number;
};

export type GetPrHealthResponse =
  | { ok: true; health: string; summary: string; details?: string[] }
  | { ok: false; error: string; code: string };

export async function getPrHealth(
  payload: GetPrHealthRequest,
): Promise<GetPrHealthResponse> {
  const res = await fetch('/api/github/prs/health', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export type CreatePrCommentRequest = {
  repoUrl: string;
  prNumber: number;
  body: string;
};

export type CreatePrCommentResponse =
  | { ok: true; commentUrl: string }
  | { ok: false; error: string; code: string };

export async function createPrComment(
  payload: CreatePrCommentRequest,
): Promise<CreatePrCommentResponse> {
  const res = await fetch('/api/github/prs/comment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
