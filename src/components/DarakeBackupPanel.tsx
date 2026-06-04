import { useEffect, useRef, useState } from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import {
  downloadDarakeBackupFile,
  exportDarakeBackup,
  importDarakeBackup,
  BACKUP_TARGET_KEYS,
} from '../utils/darakeBackup';

type ImportStatus =
  | { kind: 'idle' }
  | { kind: 'success'; restoredKeys: string[] }
  | { kind: 'error'; message: string };

export function DarakeBackupPanel() {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus>({ kind: 'idle' });
  const [crossTabNotice, setCrossTabNotice] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recompute preview JSON only when the details section is opened
  useEffect(() => {
    if (previewOpen) {
      setPreviewJson(JSON.stringify(exportDarakeBackup(), null, 2));
    }
  }, [previewOpen]);

  // Detect cross-tab storage changes and show a notice
  useEffect(() => {
    function handleStorage(e: StorageEvent): void {
      if (e.key && BACKUP_TARGET_KEYS.includes(e.key as (typeof BACKUP_TARGET_KEYS)[number])) {
        setCrossTabNotice(true);
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function handleExport() {
    try {
      downloadDarakeBackupFile();
    } catch {
      // Download API not available in this environment; fall back to nothing
    }
  }

  function handleImport() {
    if (!importText.trim()) {
      setImportStatus({ kind: 'error', message: 'JSONを貼り付けてください。' });
      return;
    }
    const result = importDarakeBackup(importText.trim());
    if (result.success) {
      setImportStatus({ kind: 'success', restoredKeys: result.restoredKeys });
      setImportText('');
    } else {
      setImportStatus({ kind: 'error', message: result.error });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setImportText(text);
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <Download />
        <div>
          <p className="eyebrow">Phase 107</p>
          <h3>バックアップ &amp; 復元</h3>
          <p>入力データをJSONでエクスポート・インポートします。複数タブの変更は自動で反映されます。</p>
        </div>
      </div>

      {crossTabNotice && (
        <div className="phaseInfoBox" style={{ borderColor: 'var(--accent, #4f8cff)' }}>
          <span style={{ marginRight: 6 }}>🔄</span>
          <strong>別タブで新しい変更があります。</strong>
          <span style={{ marginLeft: 8, fontSize: '0.82rem', color: 'var(--muted)' }}>
            このページを再読み込みするか、そのままお使いください。
          </span>
          <button
            type="button"
            style={{ marginLeft: 12, fontSize: '0.78rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--accent, #4f8cff)', textDecoration: 'underline' }}
            onClick={() => setCrossTabNotice(false)}
          >
            閉じる
          </button>
        </div>
      )}

      {/* Export */}
      <section>
        <h4 style={{ marginBottom: 8 }}>📤 エクスポート</h4>
        <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: 10 }}>
          対象: やさしいアプリ開始フォーム・おまかせ開始状態・Issue下書き。
          シークレット・トークンは含みません。
        </p>
        <div className="phaseControls">
          <button type="button" className="phaseCopyBtn" onClick={handleExport}>
            <Download size={15} />
            JSONファイルをダウンロード
          </button>
        </div>

        <details
          style={{ marginTop: 12 }}
          onToggle={(e) => setPreviewOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--muted)' }}>
            プレビュー（現在の保存データ）
          </summary>
          <pre
            style={{
              fontSize: '0.72rem',
              background: 'rgba(0,0,0,0.04)',
              borderRadius: 6,
              padding: '10px 12px',
              overflowX: 'auto',
              marginTop: 8,
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {previewJson}
          </pre>
        </details>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border, #e5e7eb)', margin: '18px 0' }} />

      {/* Import */}
      <section>
        <h4 style={{ marginBottom: 8 }}>📥 インポート（復元）</h4>
        <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: 10 }}>
          以前エクスポートしたJSONを貼り付けるか、ファイルを選択してください。
          現在のデータは上書きされます。
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="phaseCopyBtn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} />
            ファイルを選択
          </button>
        </div>

        <textarea
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setImportStatus({ kind: 'idle' });
          }}
          placeholder='{"version":1,"exportedAt":"...","data":{...}}'
          rows={6}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            padding: '8px 10px',
            border: '1px solid var(--border, #d1d5db)',
            borderRadius: 6,
            resize: 'vertical',
            background: 'var(--surface, #fff)',
            color: 'var(--text, #111)',
            boxSizing: 'border-box',
          }}
        />

        {importStatus.kind === 'success' && (
          <div className="phaseInfoBox" style={{ marginTop: 8 }}>
            <strong>✅ 復元完了</strong>
            {importStatus.restoredKeys.length > 0 ? (
              <ul style={{ margin: '4px 0 0 16px', fontSize: '0.8rem' }}>
                {importStatus.restoredKeys.map((k) => (
                  <li key={k}><code>{k}</code></li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>
                対象キーのデータがバックアップに含まれていませんでした。
              </p>
            )}
          </div>
        )}

        {importStatus.kind === 'error' && (
          <div className="phaseSafetyBox" style={{ marginTop: 8 }}>
            <strong>⚠️ インポート失敗</strong>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>{importStatus.message}</p>
          </div>
        )}

        <div className="phaseControls" style={{ marginTop: 10 }}>
          <button
            type="button"
            className="phaseCopyBtn"
            onClick={handleImport}
            disabled={!importText.trim()}
          >
            <RefreshCw size={15} />
            インポートして復元
          </button>
        </div>
      </section>

      <div className="phaseInfoBox" style={{ marginTop: 18 }}>
        <strong>📌 バックアップ対象データ</strong>
        <ul style={{ margin: '6px 0 0 16px', fontSize: '0.8rem' }}>
          {BACKUP_TARGET_KEYS.map((k) => (
            <li key={k}><code>{k}</code></li>
          ))}
        </ul>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>
          シークレット・APIトークン・Webhook URLは対象外です。
        </p>
      </div>
    </div>
  );
}
