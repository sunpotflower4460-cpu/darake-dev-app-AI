import { useState } from 'react';
import { Check, Copy, Layers, Trash2 } from 'lucide-react';
import {
  AppIdea,
  buildInitialAppIdea,
  loadAppIdeaBatch,
  saveAppIdeaBatch,
  addAppIdea,
  updateAppIdea,
  deleteAppIdea,
  calculatePriorityScore,
  sortByPriority,
  formatAppIdeaBatchMarkdown,
} from '../utils/appIdeaBatch';

type CopyState = 'idle' | 'copied' | 'failed';

export function AppIdeaBatchPanel() {
  const [ideas, setIdeas] = useState<AppIdea[]>(() => sortByPriority(loadAppIdeaBatch()));
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  function handleChange<K extends keyof AppIdea>(id: string, key: K, value: AppIdea[K]) {
    setIdeas((prev) => {
      const updated = prev.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, [key]: value };
        next.priorityScore = calculatePriorityScore(next);
        return next;
      });
      return sortByPriority(updated);
    });
  }

  function handleAdd() {
    const newIdea = buildInitialAppIdea();
    newIdea.priorityScore = calculatePriorityScore(newIdea);
    setIdeas((prev) => sortByPriority(addAppIdea(prev, newIdea)));
  }

  function handleDelete(id: string) {
    setIdeas((prev) => deleteAppIdea(prev, id));
  }

  function handleSave() {
    saveAppIdeaBatch(ideas);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAppIdeaBatchMarkdown(ideas));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase23Panel">
      <div className="phase23Hero">
        <Layers />
        <div>
          <p className="eyebrow">Phase 23.1-23.2</p>
          <h3>アプリ案バッチ（工房モード）</h3>
          <p>複数のアプリ案を並べて優先順位をつけます。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 アプリ案管理（外部API呼び出しなし）</strong>
        <p>スコアを入力すると優先度が自動計算されます。</p>
      </div>

      <div className="phase23IdeaList">
        {ideas.length === 0 && (
          <div className="phaseInfoBox"><p>アプリ案がありません。「+ 案を追加」から追加してください。</p></div>
        )}
        {ideas.map((idea, rank) => (
          <div key={idea.id} className="phase23IdeaItem">
            <div className="phase23IdeaHeader">
              <span className="phase23Rank">#{rank + 1}</span>
              <span className="phase23PriorityScore">優先度: {idea.priorityScore}</span>
              <span className={`phaseStatusBadge phaseStatusBadge-${idea.complexity === 'small' ? 'ok' : idea.complexity === 'medium' ? 'warning' : 'blocked'}`}>
                {idea.complexity}
              </span>
              <button type="button" className="phase19DeleteBtn" onClick={() => handleDelete(idea.id)} aria-label="削除">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="phaseForm">
              <label>
                タイトル
                <input value={idea.title} onChange={(e) => handleChange(idea.id, 'title', e.target.value)} placeholder="例: ねこ電卓" />
              </label>
              <label>
                アイデアの種
                <textarea rows={2} value={idea.seed} onChange={(e) => handleChange(idea.id, 'seed', e.target.value)} placeholder="例: 眠そうなねこが計算してくれる癒し系電卓" />
              </label>
              <label>
                ターゲットユーザー
                <input value={idea.targetUser} onChange={(e) => handleChange(idea.id, 'targetUser', e.target.value)} placeholder="例: 学生・日常使い" />
              </label>
              <label>
                複雑度
                <select value={idea.complexity} onChange={(e) => handleChange(idea.id, 'complexity', e.target.value as AppIdea['complexity'])}>
                  <option value="small">小（1〜2週間）</option>
                  <option value="medium">中（1ヶ月程度）</option>
                  <option value="large">大（2ヶ月以上）</option>
                </select>
              </label>
              <div className="phase23ScoreGrid">
                <label>
                  夢スコア (1-5)
                  <input type="number" min="1" max="5" value={idea.dreamScore} onChange={(e) => handleChange(idea.id, 'dreamScore', Number(e.target.value))} />
                </label>
                <label>
                  容易さ (1-5)
                  <input type="number" min="1" max="5" value={idea.easeScore} onChange={(e) => handleChange(idea.id, 'easeScore', Number(e.target.value))} />
                </label>
                <label>
                  収益可能性 (1-5)
                  <input type="number" min="1" max="5" value={idea.revenuePotentialScore} onChange={(e) => handleChange(idea.id, 'revenuePotentialScore', Number(e.target.value))} />
                </label>
                <label>
                  独自性 (1-5)
                  <input type="number" min="1" max="5" value={idea.uniquenessScore} onChange={(e) => handleChange(idea.id, 'uniquenessScore', Number(e.target.value))} />
                </label>
              </div>
              <label>
                収益ヒント
                <input value={idea.monetizationHint} onChange={(e) => handleChange(idea.id, 'monetizationHint', e.target.value)} placeholder="例: 買い切り¥120" />
              </label>
              <label>
                ノート
                <textarea rows={2} value={idea.notes} onChange={(e) => handleChange(idea.id, 'notes', e.target.value)} placeholder="その他メモ" />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleAdd}>+ 案を追加</button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'バッチコピー'}
        </button>
      </div>
    </div>
  );
}
