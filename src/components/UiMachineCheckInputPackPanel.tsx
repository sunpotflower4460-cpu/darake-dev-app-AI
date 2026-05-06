import { useMemo, useState } from 'react';
import { Check, Copy, PackageCheck, RefreshCcw } from 'lucide-react';
import {
  buildUiMachineCheckInputPack,
} from '../utils/uiMachineCheckInputPack';

export function UiMachineCheckInputPackPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const pack = useMemo(() => buildUiMachineCheckInputPack(), [reloadKey]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pack.markdown);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="uiMachineCheckInputPackPanel">
      <div className={`uiMachineCheckInputPackHero input-pack-${pack.status}`}>
        <PackageCheck />
        <div>
          <p className="eyebrow">Phase 10.28</p>
          <h3>UI Machine Check Input Pack</h3>
          <p>{pack.message}</p>
        </div>
      </div>

      <div className="uiMachineCheckInputPackSafetyBox">
        <strong>Input Pack作成のみです</strong>
        <p>UIチェックに渡す入力情報をまとめます。実際の画像解析・AIレビュー・GitHub Actions dispatchは行いません。</p>
      </div>

      <div className="uiMachineCheckInputPackControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新記録を再読み込み
        </button>
        <button type="button" className={`uiMachineCheckInputPackCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'コピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'Input PackをMarkdownコピー'}
        </button>
        <span>{pack.status}</span>
      </div>

      <div className="uiMachineCheckInputPackSummaryGrid">
        <section>
          <h4>Status</h4>
          <p>{pack.status}</p>
        </section>
        <section>
          <h4>チェック項目</h4>
          <p>{pack.checkItems.length}件</p>
        </section>
        <section>
          <h4>Hard Stops</h4>
          <p>{pack.hardStops.length}</p>
        </section>
      </div>

      <div className="uiMachineCheckInputPackSourceBox">
        <div>
          <strong>入力元 (Source)</strong>
          <span>manifest record</span>
        </div>
        <ul>
          <li>artifactUrl: {pack.source.artifactUrl || '未入力'}</li>
          <li>workflowRunUrl: {pack.source.workflowRunUrl || '未入力'}</li>
          <li>capturedCount: {pack.source.capturedCount || '未入力'}</li>
          <li>failedCount: {pack.source.failedCount || '未入力'}</li>
          <li>notes: {pack.source.notes || 'なし'}</li>
        </ul>
      </div>

      <div className="uiMachineCheckInputPackCheckBox">
        <div>
          <strong>UIチェック項目</strong>
          <span>{pack.checkItems.length}件</span>
        </div>
        <ul className="uiMachineCheckInputPackCheckList">
          {pack.checkItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="uiMachineCheckInputPackRulesBox">
        <div>
          <strong>Machine Rules</strong>
          <span>{pack.machineRules.length}件</span>
        </div>
        <ul className="uiMachineCheckInputPackRulesList">
          {pack.machineRules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </div>

      {pack.hardStops.length > 0 && (
        <div className="uiMachineCheckInputPackHardStopsBox">
          <strong>Hard Stops</strong>
          <ul>
            {pack.hardStops.map((stop) => <li key={stop}>{stop}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
