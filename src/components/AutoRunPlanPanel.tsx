import { useMemo, useState } from 'react';
import { Check, Copy, Rocket, RotateCcw, Save } from 'lucide-react';
import { autoContinueRules } from '../data/autoContinueRules';
import { autoRunPlanSections } from '../data/autoRunPlan';
import { buildAutoRunPhaseQueue, summarizeAutoRunQueue } from '../utils/autoRunPhaseQueue';
import { clearAutoRunPlan, loadAutoRunPlan, saveAutoRunPlan } from '../utils/autoRunPlanStore';
import { buildCompletionReport, formatCompletionReport } from '../utils/completionReport';
import { classifyRiskList, summarizeRisk } from '../utils/riskClassifier';
import { buildSavedAutoRunPlanQueue } from '../utils/savedAutoRunPlanQueue';
import { buildSavedQueuePreflight } from '../utils/savedQueuePreflight';

const defaultAutoScope = ['UI実装', 'モックデータ', 'CSS調整', 'README更新', 'CI確認', 'Snapshot確認'];
const defaultStopConditions = ['secret / token / key が必要', '認証・課金・本番DB変更', 'Build不能', 'App Store / 本番公開判断'];

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function AutoRunPlanPanel() {
  const savedPlan = useMemo(() => loadAutoRunPlan(), []);
  const [appName, setAppName] = useState(savedPlan.appName);
  const [seed, setSeed] = useState(savedPlan.seed);
  const [completionDefinition, setCompletionDefinition] = useState(savedPlan.completionDefinition);
  const [autoScope, setAutoScope] = useState(savedPlan.autoScope || defaultAutoScope.join('\n'));
  const [savedAt, setSavedAt] = useState(savedPlan.savedAt ?? '');
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const generatedPlan = useMemo(() => {
    const autoItems = splitLines(autoScope);
    return {
      appName: appName || '未入力のアプリ',
      seed: seed || '魂・種はまだ未入力です。',
      completionDefinition: completionDefinition || '完成間近の定義はまだ未入力です。',
      autoItems: autoItems.length > 0 ? autoItems : defaultAutoScope,
      stopConditions: defaultStopConditions,
    };
  }, [appName, seed, completionDefinition, autoScope]);
  const classifications = useMemo(() => classifyRiskList(generatedPlan.autoItems), [generatedPlan.autoItems]);
  const riskSummary = useMemo(() => summarizeRisk(classifications), [classifications]);
  const phaseQueue = useMemo(() => buildAutoRunPhaseQueue(classifications), [classifications]);
  const queueSummary = useMemo(() => summarizeAutoRunQueue(phaseQueue), [phaseQueue]);
  const completionReport = useMemo(() => buildCompletionReport(phaseQueue, classifications), [phaseQueue, classifications]);
  const formattedCompletionReport = useMemo(() => formatCompletionReport(completionReport), [completionReport]);
  const savedQueue = useMemo(() => buildSavedAutoRunPlanQueue({ appName, seed, completionDefinition, autoScope, savedAt }), [appName, seed, completionDefinition, autoScope, savedAt]);
  const savedQueuePreflight = useMemo(() => buildSavedQueuePreflight(savedQueue), [savedQueue]);

  function handleSavePlan() {
    const next = saveAutoRunPlan({ appName, seed, completionDefinition, autoScope });
    setSavedAt(next.savedAt ?? '');
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  function handleClearPlan() {
    const next = clearAutoRunPlan();
    setAppName(next.appName);
    setSeed(next.seed);
    setCompletionDefinition(next.completionDefinition);
    setAutoScope(defaultAutoScope.join('\n'));
    setSavedAt('');
    setSaveState('idle');
  }

  async function handleCopyCompletionReport() {
    try {
      await navigator.clipboard.writeText(formattedCompletionReport);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="autoRunPlanPanel">
      <div className="autoRunHero">
        <Rocket />
        <div>
          <p className="eyebrow">Phase 8.9</p>
          <h3>一括オート進行モード設計</h3>
          <p>「作りたい」を受け取ったあと、完成間近まで自動で進み、必要な手動項目は最後にまとめるための地図です。</p>
        </div>
      </div>

      <div className="autoRunPrinciple">
        <strong>Batch Gate Mode</strong>
        <p>途中で小さく止まらず、どうしても進めない時だけ止まります。軽微な問題や手動項目は完成間近レポートへまとめます。</p>
      </div>

      <div className="autoRunForm">
        <div>
          <strong>Auto Run Plan生成フォーム</strong>
          <p>まだ実行はしません。最初に渡す「作りたい」を、一括進行用の計画に変換するための入力欄です。</p>
        </div>
        <div className="autoRunSaveRow">
          <button type="button" onClick={handleSavePlan}>{saveState === 'saved' ? <Check size={16} /> : <Save size={16} />} {saveState === 'saved' ? '保存しました' : 'Auto Run Planを保存'}</button>
          <button type="button" className="secondaryAutoRunButton" onClick={handleClearPlan}><RotateCcw size={16} /> 空にする</button>
          {savedAt && <span>保存時刻: {savedAt}</span>}
        </div>
        <label>
          アプリ名
          <input value={appName} placeholder="例：猫の健康メモ" onChange={(event) => setAppName(event.target.value)} />
        </label>
        <label>
          魂・種
          <textarea rows={3} value={seed} placeholder="例：猫と暮らす人が、食事や体調をやさしく記録できるアプリ" onChange={(event) => setSeed(event.target.value)} />
        </label>
        <label>
          完成間近の定義
          <textarea rows={3} value={completionDefinition} placeholder="例：スマホで触れて、主要画面とモック導線が通り、App Store準備前まで進んでいる" onChange={(event) => setCompletionDefinition(event.target.value)} />
        </label>
        <label>
          自動で進めたい範囲（一行ずつ）
          <textarea rows={5} value={autoScope} onChange={(event) => setAutoScope(event.target.value)} />
        </label>
      </div>

      <div className={`savedQueuePreflightBox preflight-${savedQueuePreflight.status}`}>
        <div>
          <strong>{savedQueuePreflight.title}</strong>
          <span>{savedQueuePreflight.status}</span>
        </div>
        <p>{savedQueuePreflight.message}</p>
        <div>{savedQueuePreflight.checks.map((check) => <span key={check}>{check}</span>)}</div>
      </div>

      <div className="savedPlanQueueBox">
        <div>
          <strong>{savedQueue.title}</strong>
          <span>{savedQueue.savedAt}</span>
        </div>
        <p>{savedQueue.message}</p>
        <div className="savedPlanQueueList">
          {savedQueue.items.length > 0 ? savedQueue.items.map((item) => (
            <article className={`savedPlanQueueItem queue-${item.status}`} key={item.id}>
              <span>{item.order}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.riskLabel} / {item.status}</small>
              </div>
            </article>
          )) : <p>保存済みPlanを作ると、ここに固定Queueが並びます。</p>}
        </div>
      </div>

      <div className="autoRunGenerated">
        <div>
          <strong>生成される一括計画のたたき台</strong>
          <span>{generatedPlan.appName}</span>
        </div>
        <p>{generatedPlan.seed}</p>
        <section>
          <h4>完成間近の定義</h4>
          <p>{generatedPlan.completionDefinition}</p>
        </section>
        <section>
          <h4>自動で進める候補</h4>
          <div>{generatedPlan.autoItems.map((item) => <span key={item}>{item}</span>)}</div>
        </section>
        <section>
          <h4>途中で止まる条件</h4>
          <div>{generatedPlan.stopConditions.map((item) => <span key={item}>{item}</span>)}</div>
        </section>
      </div>

      <div className="riskClassifierBox">
        <div>
          <strong>Risk Classifier</strong>
          <span>safe {riskSummary.safeAuto} / review {riskSummary.reviewNeeded} / manual {riskSummary.manualGate} / blocked {riskSummary.blocked}</span>
        </div>
        <p>入力した作業を、自動候補・後で確認・手動ゲート・必ず停止に分類します。Batch Gate Modeでは、後で確認できるものは完成間近レポートへ回します。</p>
        <div className="riskClassifierGrid">
          {classifications.map((classification) => (
            <article className={`riskClassifierCard risk-${classification.risk}`} key={classification.item}>
              <div>
                <strong>{classification.item}</strong>
                <span>{classification.label}</span>
              </div>
              <p>{classification.reason}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="autoPhaseQueueBox">
        <div>
          <strong>Phase Queue</strong>
          <span>pending {queueSummary.pending} / review {queueSummary.needsReview} / blocked {queueSummary.blocked}</span>
        </div>
        <p>分類済みの作業候補を、実行前のQueueとして順番に並べます。まだ自動実行はしません。</p>
        <div className="autoPhaseQueueList">
          {phaseQueue.map((item) => (
            <article className={`autoPhaseQueueItem queue-${item.status}`} key={item.id}>
              <span>{item.order}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.riskLabel} / {item.status}</small>
                <p>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="autoContinueRuleBox">
        <div>
          <strong>Auto Continue Rule</strong>
          <span>実行前ルール</span>
        </div>
        <p>前のQueue itemが成功したら次へ進みます。ただし、軽微な注意は完成間近レポートへ回し、致命的な条件だけ途中で止めます。</p>
        <div className="autoContinueRuleGrid">
          {autoContinueRules.map((rule) => (
            <article className={`autoContinueRuleCard rule-${rule.type}`} key={rule.id}>
              <strong>{rule.title}</strong>
              <p>{rule.detail}</p>
              <div>{rule.examples.map((example) => <span key={example}>{example}</span>)}</div>
            </article>
          ))}
        </div>
      </div>

      <div className="completionReportBox">
        <div>
          <strong>{completionReport.title}</strong>
          <span>完成間近</span>
        </div>
        <p>{completionReport.message}</p>
        <div className="completionCopyRow">
          <button type="button" className={`completionCopyButton copy-${copyState}`} onClick={handleCopyCompletionReport}>
            {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
            {copyState === 'copied' && 'レポートをコピーしました'}
            {copyState === 'failed' && 'コピーできませんでした'}
            {copyState === 'idle' && 'Completion Reportをコピー'}
          </button>
          <span>チャット・Issue・メモへ貼れるMarkdown形式です。</span>
        </div>
        <div className="completionReportGrid">
          <section>
            <h4>できたこと候補</h4>
            {completionReport.doneItems.map((item) => <span key={item}>{item}</span>)}
          </section>
          <section>
            <h4>最後にまとめる注意点</h4>
            {completionReport.batchedNotes.map((item) => <span key={item}>{item}</span>)}
          </section>
          <section>
            <h4>手動項目</h4>
            {completionReport.manualItems.map((item) => <span key={item}>{item}</span>)}
          </section>
          <section>
            <h4>途中停止候補</h4>
            {completionReport.hardStopItems.map((item) => <span key={item}>{item}</span>)}
          </section>
        </div>
        <section className="completionNextBox">
          <h4>次のおすすめ</h4>
          <div>{completionReport.nextRecommendations.map((item) => <span key={item}>{item}</span>)}</div>
        </section>
      </div>

      <div className="autoRunGrid">
        {autoRunPlanSections.map((section) => (
          <article className={`autoRunCard auto-${section.id}`} key={section.id}>
            <strong>{section.title}</strong>
            <p>{section.detail}</p>
            <div>
              {section.items.map((item) => <span key={item}>{item}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
