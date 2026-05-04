import { useMemo, useState } from 'react';
import { Rocket } from 'lucide-react';
import { autoRunPlanSections } from '../data/autoRunPlan';

const defaultAutoScope = ['UI実装', 'モックデータ', 'CSS調整', 'README更新', 'CI確認', 'Snapshot確認'];
const defaultStopConditions = ['secret / token / key が必要', '認証・課金・本番DB変更', 'Build不能', 'App Store / 本番公開判断'];

function splitLines(value: string): string[] {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function AutoRunPlanPanel() {
  const [appName, setAppName] = useState('');
  const [seed, setSeed] = useState('');
  const [completionDefinition, setCompletionDefinition] = useState('');
  const [autoScope, setAutoScope] = useState(defaultAutoScope.join('\n'));

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

  return (
    <div className="autoRunPlanPanel">
      <div className="autoRunHero">
        <Rocket />
        <div>
          <p className="eyebrow">Phase 8.1</p>
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
