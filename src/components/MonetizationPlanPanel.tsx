import { useState } from 'react';
import { Check, Copy, DollarSign, Trash2 } from 'lucide-react';
import {
  MonetizationPlan,
  MonetizationModel,
  buildInitialMonetizationPlan,
  loadMonetizationPlans,
  saveMonetizationPlans,
  addMonetizationPlan,
  updateMonetizationPlan,
  deleteMonetizationPlan,
  formatMonetizationPlanMarkdown,
  getMonetizationModelLabel,
} from '../utils/monetizationPlan';

type CopyState = { [id: string]: 'idle' | 'copied' | 'failed' };

const MODELS: MonetizationModel[] = [
  'free', 'one-time-paid', 'subscription', 'freemium', 'ads', 'donation', 'unknown',
];

export function MonetizationPlanPanel() {
  const [plans, setPlans] = useState<MonetizationPlan[]>(loadMonetizationPlans);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [saveMsg, setSaveMsg] = useState('');

  function handleChange<K extends keyof MonetizationPlan>(appId: string, key: K, value: MonetizationPlan[K]) {
    setPlans((prev) => updateMonetizationPlan(prev, { ...prev.find((p) => p.appId === appId)!, [key]: value }));
  }

  function handleAdd() {
    setPlans((prev) => addMonetizationPlan(prev, buildInitialMonetizationPlan()));
  }

  function handleDelete(appId: string) {
    setPlans((prev) => deleteMonetizationPlan(prev, appId));
  }

  function handleSave() {
    saveMonetizationPlans(plans);
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleCopy(plan: MonetizationPlan) {
    try {
      await navigator.clipboard.writeText(formatMonetizationPlanMarkdown(plan));
      setCopyStates((prev) => ({ ...prev, [plan.appId]: 'copied' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [plan.appId]: 'idle' })), 1800);
    } catch {
      setCopyStates((prev) => ({ ...prev, [plan.appId]: 'failed' }));
      window.setTimeout(() => setCopyStates((prev) => ({ ...prev, [plan.appId]: 'idle' })), 2400);
    }
  }

  return (
    <div className="phase22Panel">
      <div className="phase22Hero">
        <DollarSign />
        <div>
          <p className="eyebrow">Phase 22.1-22.2</p>
          <h3>収益化プランメモ</h3>
          <p>アプリの収益化プランを管理します。これは自己管理メモです。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>📝 収益化メモ（投資・金融助言ではありません）</strong>
        <p>自動価格設定・自動課金設定は行いません。</p>
      </div>

      <div className="phase22PlanList">
        {plans.length === 0 && (
          <div className="phaseInfoBox"><p>収益化プランがありません。「+ プラン追加」から追加してください。</p></div>
        )}
        {plans.map((plan) => (
          <div key={plan.appId} className="phase22PlanItem">
            <div className="phase22PlanHeader">
              <span className="phase22AppName">{plan.appName || '（アプリ名未設定）'}</span>
              <span className={`phaseStatusBadge ${plan.model === 'unknown' ? 'phaseStatusBadge-draft' : 'phaseStatusBadge-ok'}`}>
                {getMonetizationModelLabel(plan.model)}
              </span>
              <button type="button" className="phase19DeleteBtn" onClick={() => handleDelete(plan.appId)} aria-label="削除">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="phaseForm">
              <label>
                アプリ名
                <input value={plan.appName} onChange={(e) => handleChange(plan.appId, 'appName', e.target.value)} placeholder="例: ねこ電卓" />
              </label>
              <label>
                収益モデル
                <select value={plan.model} onChange={(e) => handleChange(plan.appId, 'model', e.target.value as MonetizationModel)}>
                  {MODELS.map((m) => <option key={m} value={m}>{getMonetizationModelLabel(m)}</option>)}
                </select>
              </label>
              <label>
                月額価格（円）
                <input value={plan.monthlyPriceJpy} onChange={(e) => handleChange(plan.appId, 'monthlyPriceJpy', e.target.value)} placeholder="例: 500" type="number" min="0" />
              </label>
              <label>
                買い切り価格（円）
                <input value={plan.oneTimePriceJpy} onChange={(e) => handleChange(plan.appId, 'oneTimePriceJpy', e.target.value)} placeholder="例: 1200" type="number" min="0" />
              </label>
              <label>
                無料範囲
                <textarea rows={2} value={plan.freeScope} onChange={(e) => handleChange(plan.appId, 'freeScope', e.target.value)} placeholder="例: 基本機能10件まで" />
              </label>
              <label>
                有料範囲
                <textarea rows={2} value={plan.paidScope} onChange={(e) => handleChange(plan.appId, 'paidScope', e.target.value)} placeholder="例: 無制限利用・エクスポート機能" />
              </label>
              <label>
                ターゲットユーザー
                <input value={plan.targetUsers} onChange={(e) => handleChange(plan.appId, 'targetUsers', e.target.value)} placeholder="例: 個人ユーザー・学生" />
              </label>
              <label>
                収益見込みメモ
                <textarea rows={2} value={plan.expectedMonthlyRevenueMemo} onChange={(e) => handleChange(plan.appId, 'expectedMonthlyRevenueMemo', e.target.value)} placeholder="例: 月100DL×500円=5万円（希望）" />
              </label>
              <label>
                コストメモ
                <textarea rows={2} value={plan.costMemo} onChange={(e) => handleChange(plan.appId, 'costMemo', e.target.value)} placeholder="例: Apple Developer ¥12,800/年" />
              </label>
              <label>
                ノート
                <textarea rows={2} value={plan.notes} onChange={(e) => handleChange(plan.appId, 'notes', e.target.value)} placeholder="その他メモ" />
              </label>
            </div>
            <div className="phase20CandidateActions">
              <button type="button" className={`phaseCopyBtn copy-${copyStates[plan.appId] ?? 'idle'}`} onClick={() => handleCopy(plan)}>
                {copyStates[plan.appId] === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                コピー
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleAdd}>+ プラン追加</button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '保存'}
        </button>
      </div>
    </div>
  );
}
