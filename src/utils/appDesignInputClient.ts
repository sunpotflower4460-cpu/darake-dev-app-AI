import type {
  BlueprintGenerationInput,
  BlueprintGenerationResult,
  DesignAssetInput,
  DesignAssetMediaType,
} from './designAsset';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_LONG_EDGE = 1280;
const ACCEPTED_TYPES: DesignAssetMediaType[] = ['image/png', 'image/jpeg', 'image/webp'];

export type FileToDesignAssetError =
  | 'unsupported-type'
  | 'too-large'
  | 'read-failed'
  | 'decode-failed';

export type FileToDesignAssetResult =
  | { ok: true; asset: DesignAssetInput }
  | { ok: false; error: FileToDesignAssetError; message: string };

export async function fileToDesignAsset(file: File): Promise<FileToDesignAssetResult> {
  if (!ACCEPTED_TYPES.includes(file.type as DesignAssetMediaType)) {
    return {
      ok: false,
      error: 'unsupported-type',
      message: 'PNG / JPEG / WebPのみアップロードできます',
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'too-large', message: '4MB以下の画像にしてください' };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longEdge : 1;
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { ok: false, error: 'decode-failed', message: '画像の処理に失敗しました' };
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close?.();

    const outputType: DesignAssetMediaType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(outputType, 0.85);
    const base64 = dataUrl.split(',')[1] ?? '';
    if (!base64) {
      return { ok: false, error: 'decode-failed', message: '画像のエンコードに失敗しました' };
    }

    return {
      ok: true,
      asset: { mediaType: outputType, base64, label: file.name },
    };
  } catch {
    return { ok: false, error: 'read-failed', message: '画像の読み込みに失敗しました' };
  }
}

export type GenerateBlueprintResponse =
  | { ok: true; result: BlueprintGenerationResult }
  | { ok: false; code: string; error: string };

export async function postGenerateBlueprintFromInput(
  input: BlueprintGenerationInput,
): Promise<GenerateBlueprintResponse> {
  try {
    const res = await fetch('/api/darake/blueprint/generate-from-input', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = (await res.json().catch(() => null)) as {
      ok?: boolean;
      result?: BlueprintGenerationResult;
      code?: string;
      error?: string;
    } | null;
    if (!json) {
      return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    }
    if (json.ok && json.result) {
      return { ok: true, result: json.result };
    }
    return {
      ok: false,
      code: json.code ?? 'UNKNOWN_ERROR',
      error: json.error ?? '生成に失敗しました',
    };
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}
