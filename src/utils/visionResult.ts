import type { DesignAssetMediaType, VisualSpec } from './designAsset';

export type Severity = 'high' | 'medium' | 'low';

export type VisionDivergence = {
  area: string;
  severity: Severity;
  fixHint: string;
};

export type VisionImageInput = {
  mediaType: DesignAssetMediaType;
  base64: string;
  label?: string;
};

export type VisionCompareRequest = {
  /** Used for KV storage key. Pass 'manual' for ad-hoc tests. */
  projectId: string;
  phaseId?: string;
  /** Run / attempt counter; included in the result for history. */
  attempt?: number;
  /** Optional Run Registry id — when set, the audit log is keyed to that run. */
  runId?: string;
  /** Optional PR context for the auto-generated fix-request comment. */
  prContext?: {
    repoUrl?: string;
    prNumber?: number;
    previewUrl?: string;
  };
  capturedScreenshots: VisionImageInput[];
  designAssets: VisionImageInput[];
  visualSpec?: VisualSpec;
  /** Plain-text hint about what to focus on (e.g. "ヘッダーの色とフォント"). */
  focusHint?: string;
  /** Optional pass threshold (0-100). Default 80. */
  passThreshold?: number;
};

export type VisionCompareResult = {
  resultId: string;
  projectId: string;
  phaseId?: string;
  attempt: number;
  pass: boolean;
  score: number;
  divergences: VisionDivergence[];
  fixInstructions: string;
  /** Pre-formatted PR comment body that can be posted to @copilot. */
  fixRequestComment: string;
  /** Echo of the model used. */
  model: string;
  /** Cost estimate in USD for this call. */
  spendUsd: number;
  createdAt: string;
};

export type VisionCompareResponse =
  | { ok: true; result: VisionCompareResult }
  | { ok: false; code: string; error: string };

export type ListVisionResultsResponse =
  | { ok: true; results: VisionCompareResult[] }
  | { ok: false; code: string; error: string };
