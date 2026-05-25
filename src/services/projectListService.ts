import type {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectResponse,
  ListProjectsResponse,
} from '../utils/darakeProject';

export async function listProjects(limit = 50): Promise<ListProjectsResponse> {
  try {
    const res = await fetch('/api/darake/projects/list', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ limit }),
    });
    const json = (await res.json().catch(() => null)) as ListProjectsResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}

export async function getProject(projectId: string): Promise<GetProjectResponse> {
  try {
    const res = await fetch('/api/darake/projects/get', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    const json = (await res.json().catch(() => null)) as GetProjectResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}

export type RequestFixResponse =
  | { ok: true; issueUrl: string; issueNumber: number; phaseId: string }
  | { ok: false; code: string; error: string };

export async function requestFix(body: {
  projectId: string;
  fixText: string;
}): Promise<RequestFixResponse> {
  try {
    const res = await fetch('/api/darake/projects/request-fix', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as RequestFixResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}

export async function createProject(
  body: CreateProjectRequest,
): Promise<CreateProjectResponse> {
  try {
    const res = await fetch('/api/darake/projects/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as CreateProjectResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}
