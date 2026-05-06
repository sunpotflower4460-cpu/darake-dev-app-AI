import { useState } from 'react';
import { Check, Copy, FileText } from 'lucide-react';
import { loadAppStoreMetadataDraft } from '../utils/appStoreMetadataDraft';
import {
  STORE_COPY_TEMPLATES,
  formatStoreCopyTemplateMarkdown,
  getStoreCopyTemplate,
} from '../utils/storeCopyTemplates';

export function StoreCopyTemplatePanel() {
  const [selectedId, setSelectedId] = useState<string>(STORE_COPY_TEMPLATES[0].id);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const selected = getStoreCopyTemplate(selectedId);
  const metaDraft = loadAppStoreMetadataDraft();

  async function handleCopy() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(formatStoreCopyTemplateMarkdown(selected, metaDraft.appName));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="storeCopyTemplatePanel">
      <div className="storeCopyTemplateHero">
        <FileText />
        <div>
          <p className="eyebrow">Phase 12.3</p>
          <h3>ストア文面テンプレート</h3>
          <p>テンプレートを選んで候補文面をコピーできます。「直接保存」はしません。まず候補を確認してください。</p>
        </div>
      </div>

      <div className="storeCopyTemplateSafetyBox">
        <strong>候補表示のみ・App Store Connect APIなし</strong>
        <p>テンプレートから候補文面をコピーし、人間がApp Store Connectに貼り付けてください。</p>
      </div>

      <div className="storeCopyTemplateSelector">
        <label htmlFor="storeCopySelect">テンプレートを選ぶ：</label>
        <select
          id="storeCopySelect"
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setCopyState('idle');
          }}
        >
          {STORE_COPY_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}（{t.tone}）</option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="storeCopyTemplateCard">
          <div className="storeCopyTemplateCardHeader">
            <strong>{selected.label}</strong>
            <span className="storeCopyToneBadge">{selected.tone}</span>
          </div>

          <div className="storeCopyTemplateSection">
            <span>サブタイトル候補</span>
            <p>{selected.subtitlePattern}</p>
          </div>
          <div className="storeCopyTemplateSection">
            <span>プロモーション文候補</span>
            <p>{selected.promotionalTextPattern}</p>
          </div>
          <div className="storeCopyTemplateSection">
            <span>説明文候補</span>
            <ul>
              {selected.descriptionSections.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div className="storeCopyTemplateSection">
            <span>キーワード候補</span>
            <p>{selected.keywordHints.join('、')}</p>
          </div>

          {selected.reviewRiskNotes.length > 0 && (
            <div className="storeCopyTemplateRiskBox">
              <span>⚠️ 審査リスクメモ</span>
              <ul>
                {selected.reviewRiskNotes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          )}

          <div className="storeCopyTemplateActions">
            <button
              type="button"
              className={`storeCopyCopyButton copy-${copyState}`}
              onClick={handleCopy}
            >
              {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
              {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
            </button>
            <p className="storeCopyTemplateNote">
              ※ この候補をApp Store Connectに貼る前に人間が確認してください。直接保存はしません。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
