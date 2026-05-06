import { useMemo, useState } from 'react';
import { Check, Copy, Package, RefreshCcw } from 'lucide-react';
import { buildAppStoreConnectInputPack } from '../utils/appStoreConnectInputPack';

export function AppStoreConnectInputPackPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'copied' | 'failed'>>({});

  const pack = useMemo(() => buildAppStoreConnectInputPack(), [reloadKey]);

  function handleReload() {
    setReloadKey((k) => k + 1);
    setCopyStates({});
  }

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [key]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [key]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [key]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [key]: 'idle' })), 2400);
    }
  }

  const SECTIONS: Array<{ key: string; label: string; value: string }> = [
    { key: 'appName', label: 'アプリ名', value: pack.metadata.appName },
    { key: 'subtitle', label: 'サブタイトル', value: pack.metadata.subtitle },
    { key: 'promotionalText', label: 'プロモーション文', value: pack.metadata.promotionalText },
    { key: 'description', label: '説明文', value: pack.metadata.description },
    { key: 'keywords', label: 'キーワード', value: pack.metadata.keywords },
    { key: 'supportUrl', label: 'サポートURL', value: pack.metadata.supportUrl },
    { key: 'privacyPolicyUrl', label: 'プライバシーポリシーURL', value: pack.metadata.privacyPolicyUrl },
    { key: 'reviewNotes', label: '審査メモ', value: pack.metadata.reviewNotes },
  ];

  return (
    <div className="appStoreInputPackPanel">
      <div className={`appStoreInputPackHero appStoreInputPack-${pack.status}`}>
        <Package />
        <div>
          <p className="eyebrow">Phase 13.2</p>
          <h3>App Store Connect 入力パック</h3>
          <p>App Store Connectに貼る情報を1パックにまとめました。セクション別にコピーできます。</p>
        </div>
      </div>

      <div className="appStoreInputPackSafetyBox">
        <strong>APIなし・コピーのみ</strong>
        <p>App Store Connect APIは呼びません。各テキストをコピーして人間がApp Store Connectに貼り付けてください。</p>
      </div>

      <div className="appStoreInputPackControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button
          type="button"
          className={`appStoreInputPackCopyButton copy-${copyStates['all'] ?? 'idle'}`}
          onClick={() => copyText('all', pack.markdown)}
        >
          {copyStates['all'] === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          全体コピー（Markdown）
        </button>
        <span className={`appStoreInputPackStatusBadge status-${pack.status}`}>{pack.status}</span>
      </div>

      <div className="appStoreInputPackSections">
        {SECTIONS.map((section) => (
          <div key={section.key} className={`appStoreInputPackSection${!section.value ? ' appStoreInputPackSection-empty' : ''}`}>
            <div className="appStoreInputPackSectionHeader">
              <span>{section.label}</span>
              {section.value ? (
                <button
                  type="button"
                  className={`appStoreInputPackSectionCopyButton copy-${copyStates[section.key] ?? 'idle'}`}
                  onClick={() => copyText(section.key, section.value)}
                >
                  {copyStates[section.key] === 'copied' ? <Check size={12} /> : <Copy size={12} />}
                  コピー
                </button>
              ) : (
                <span className="appStoreInputPackEmpty">未入力</span>
              )}
            </div>
            {section.value && (
              <pre className="appStoreInputPackSectionValue">{section.value}</pre>
            )}
          </div>
        ))}
      </div>

      <div className="appStoreInputPackSummaryBox">
        <div><span>プライバシー</span><p>{pack.privacySummary}</p></div>
        <div><span>年齢レーティング</span><p>{pack.ageRatingSummary}</p></div>
        <div><span>スクショ</span><p>{pack.screenshotSummary}</p></div>
      </div>

      <div className="appStoreInputPackManualBox">
        <strong>🔒 手動ステップ（App Store Connect上で人間が行う）</strong>
        <ol>
          {pack.manualSteps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>
    </div>
  );
}
