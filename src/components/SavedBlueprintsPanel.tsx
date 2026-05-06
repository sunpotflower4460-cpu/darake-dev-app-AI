import { useEffect, useState } from 'react';
import { BookMarked, Copy, Trash2 } from 'lucide-react';
import {
  loadSavedBlueprints,
  saveSavedBlueprints,
  deleteSavedBlueprint,
} from '../utils/savedBlueprints';
import { formatPhasePlanMarkdown } from '../utils/phasePlanGenerator';

export function SavedBlueprintsPanel() {
  const [blueprints, setBlueprints] = useState(loadSavedBlueprints());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setBlueprints(loadSavedBlueprints());
  }, []);

  function handleDelete(id: string) {
    if (!window.confirm('削除しますか？')) return;
    const updated = deleteSavedBlueprint(blueprints, id);
    saveSavedBlueprints(updated);
    setBlueprints(updated);
  }

  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase17Panel">
      <div className="phase17Hero">
        <BookMarked />
        <div>
          <p className="eyebrow">Phase 17.6</p>
          <h3>保存済み設計書 / Saved Blueprints</h3>
          <p>保存した設計書を再利用できます。localStorageキー: darake.savedBlueprints.v1</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし</strong>
      </div>

      {blueprints.length === 0 ? (
        <div className="phaseInfoBox">
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>保存された設計書はありません。Phase 17.2で生成・保存してください。</p>
        </div>
      ) : (
        <div className="phaseItemList">
          {blueprints.map((bp) => (
            <div key={bp.id} className="phaseAppCard">
              <div className="phaseAppCardName">{bp.appName}</div>
              <div className="phaseAppCardMeta">
                <span className="phaseItemBadge">{bp.templateLabel}</span>
                <span className="phaseItemBadge">{bp.platform}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{bp.createdAt.slice(0, 10)}</span>
              </div>
              {bp.soul && <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)' }}>{bp.soul}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(76,124,85,0.3)', background: 'transparent', cursor: 'pointer', color: '#35513d', display: 'inline-flex', gap: '4px', alignItems: 'center' }}
                  onClick={() => handleCopy(bp.id, formatPhasePlanMarkdown(bp.plan))}
                >
                  {copiedId === bp.id ? '✅ コピー済み' : <><Copy size={12} /> Phase計画コピー</>}
                </button>
                <button
                  type="button"
                  style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(180,91,93,0.3)', background: 'transparent', cursor: 'pointer', color: '#7e3436' }}
                  onClick={() => handleDelete(bp.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
