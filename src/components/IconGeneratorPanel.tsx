import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { generateIcon, svgToPngDataUrl } from '../services/iconService';

type Status =
  | { kind: 'idle' }
  | { kind: 'generating' }
  | { kind: 'done'; svg: string }
  | { kind: 'error'; message: string };

export function IconGeneratorPanel() {
  const [appName, setAppName] = useState('');
  const [vibe, setVibe] = useState('');
  const [paletteText, setPaletteText] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [pngBusy, setPngBusy] = useState(false);

  async function handleGenerate() {
    if (!appName.trim()) {
      setStatus({ kind: 'error', message: 'アプリ名を入力してください' });
      return;
    }
    setStatus({ kind: 'generating' });
    const palette = paletteText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await generateIcon({
      appName: appName.trim(),
      vibe: vibe.trim() || undefined,
      palette,
    });
    if (res.ok) {
      setStatus({ kind: 'done', svg: res.svg });
    } else {
      setStatus({ kind: 'error', message: `[${res.code}] ${res.error}` });
    }
  }

  async function downloadPng(svg: string) {
    setPngBusy(true);
    try {
      const dataUrl = await svgToPngDataUrl(svg, 1024);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${appName.trim() || 'icon'}-1024.png`;
      a.click();
    } catch {
      setStatus({ kind: 'error', message: 'PNG変換に失敗しました' });
    } finally {
      setPngBusy(false);
    }
  }

  function downloadSvg(svg: string) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName.trim() || 'icon'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const svg = status.kind === 'done' ? status.svg : null;

  return (
    <div className="appDesignInputPanel">
      <div className="appDesignInputHero">
        <Sparkles />
        <div>
          <p className="eyebrow">Phase 106 / Icon</p>
          <h3>アプリアイコン生成</h3>
          <p>アプリ名と雰囲気からAIがSVGアイコンを生成します。1024px PNGとして書き出して申請に使えます。</p>
        </div>
      </div>

      <div className="appDesignInputSafety">
        <strong>設定が必要:</strong> Worker Secret <code>ANTHROPIC_API_KEY</code> と wrangler変数{' '}
        <code>DARAKE_ICON_GEN_ENABLED=true</code>。
      </div>

      <div className="appDesignInputForm">
        <fieldset>
          <legend>アイコンの条件</legend>
          <label>
            アプリ名
            <input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="例: ねこ電卓" maxLength={80} />
          </label>
          <label>
            雰囲気 (任意)
            <input value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="例: 癒し系・やわらかい・ねこ" />
          </label>
          <label>
            推奨カラー (カンマ区切り・任意)
            <input value={paletteText} onChange={(e) => setPaletteText(e.target.value)} placeholder="#f4a261, #2a9d8f" />
          </label>
        </fieldset>
      </div>

      <div className="appDesignInputControls">
        <button type="button" className="primary" onClick={handleGenerate} disabled={status.kind === 'generating'}>
          {status.kind === 'generating' ? '生成中…' : 'アイコンを生成'}
        </button>
        {status.kind === 'error' && <span className="appDesignInputStatus error">{status.message}</span>}
      </div>

      {svg && (
        <div className="appDesignInputResult">
          <h4>生成されたアイコン</h4>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(76,124,85,0.2)',
            }}
            // The SVG is sanitized server-side (no scripts/external refs).
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div className="appDesignInputControls">
            <button type="button" className="primary" onClick={() => void downloadPng(svg)} disabled={pngBusy}>
              <Download size={14} /> {pngBusy ? 'PNG変換中…' : '1024px PNGを保存'}
            </button>
            <button type="button" className="primary" onClick={() => downloadSvg(svg)}>
              <Download size={14} /> SVGを保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
