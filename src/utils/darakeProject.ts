import type { DesignAssetRef, VisualSpec } from './designAsset';
import type { GeneratedPhasePlan } from './phasePlanGenerator';

export type DarakeProjectStatus =
  | 'planning'
  | 'building'
  | 'verifying'
  | 'awaiting-user'
  | 'submitting'
  | 'done'
  | 'failed'
  | 'paused';

export type DarakeProject = {
  id: string;
  name: string;
  repoUrl: string;
  repoFullName: string;
  pagesProjectName?: string;
  pagesPreviewBaseUrl?: string;
  designSummary?: string;
  designAssets?: DesignAssetRef[];
  visualSpec?: VisualSpec;
  plan?: GeneratedPhasePlan;
  currentPhaseId?: string;
  /** phaseId -> DarakeRemoteRun id */
  phaseRunIds?: Record<string, string>;
  status: DarakeProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  projectName: string;
  templateRepoUrl?: string;
  description?: string;
  designSummary?: string;
  visualSpec?: VisualSpec;
  plan?: GeneratedPhasePlan;
  private?: boolean;
};

export type CreateProjectResponse =
  | { ok: true; project: DarakeProject }
  | { ok: false; code: string; error: string };

export type ListProjectsResponse =
  | { ok: true; projects: DarakeProject[] }
  | { ok: false; code: string; error: string };

export type GetProjectResponse =
  | { ok: true; project: DarakeProject }
  | { ok: false; code: string; error: string };

export function projectStatusLabel(status: DarakeProjectStatus): string {
  switch (status) {
    case 'planning':
      return '計画中';
    case 'building':
      return '実装中';
    case 'verifying':
      return '検証中';
    case 'awaiting-user':
      return 'ユーザー確認待ち';
    case 'submitting':
      return '申請中';
    case 'done':
      return '完成';
    case 'failed':
      return '失敗';
    case 'paused':
      return '一時停止';
    default:
      return status;
  }
}
