import { useMemo, useState } from 'react';
import '../safetyGateV2.css';
import {
  checkActionSafety,
  SAFETY_RULES,
  runSafetyGateV2TestCases,
  type SafetyCategory,
} from '../utils/safetyGateV2';

const DECISION_LABEL: Record<string, string> = {
  stop: '必ず止まります',
  ask: '確認してください',
  allow: '進んで大丈夫です',
  unknown: '判断できません',
};

const GROUP_TITLES: Record<SafetyCategory, string> = {
  'always-stop': '必ず止まるもの',
  'ask-human': '確認するもの',
  'always-allow': '安全に進めるもの',
};

export function SafetyGateV2Panel() {
  const [action, setAction] = useState('');
  const [result, setResult] = useState<ReturnType<typeof checkActionSafety> | null>(null);
  const testResults = useMemo(() => runSafetyGateV2TestCases(), []);
  const passedCount = testResults.filter((item) => item.passed).length;

  function check() {
    if (!action.trim()) return;
    setResult(checkActionSafety(action.trim()));
  }

  const categories: SafetyCategory[] = ['always-stop', 'ask-human', 'always-allow'];

  return (
    <section className="safetyGateV2" aria-label="安全ゲート v2">
      <span className="safetyGateV2__eyebrow">Phase 96 · 安全ゲート</span>
      <h2 className="safetyGateV2__title">だらけても危なくならないルール</h2>

      <div className="safetyGateV2__checker">
        <input
          className="safetyGateV2__input"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="例: PRをマージする、本番デプロイ実行"
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button type="button" className="safetyGateV2__check" onClick={check}>
          確認する
        </button>
      </div>

      {result ? (
        <div className={`safetyGateV2__result safetyGateV2__result--${result.decision}`}>
          <div className="safetyGateV2__decision">
            {DECISION_LABEL[result.decision]}
          </div>
          <div className="safetyGateV2__message">{result.message}</div>
          {result.matchedRule ? (
            <div className="safetyGateV2__matched">
              ルール: {result.matchedRule.label}（例: {result.matchedRule.example}）
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="safetyGateV2__tables">
        {categories.map((cat) => {
          const rules = SAFETY_RULES.filter((r) => r.category === cat);
          return (
            <div key={cat} className="safetyGateV2__group">
              <span className={`safetyGateV2__groupTitle safetyGateV2__groupTitle--${cat === 'always-stop' ? 'stop' : cat === 'ask-human' ? 'ask' : 'allow'}`}>
                {GROUP_TITLES[cat]}
              </span>
              <ul className="safetyGateV2__ruleList">
                {rules.map((r) => (
                  <li key={r.id} className="safetyGateV2__rule">
                    <span className="safetyGateV2__ruleLabel">{r.label}</span>
                    <span className="safetyGateV2__ruleExample">{r.example}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="safetyGateV2__test">
        <span className="safetyGateV2__testTitle">最低限テスト: {passedCount}/{testResults.length} pass</span>
        <ul className="safetyGateV2__testList">
          {testResults.map((item) => (
            <li
              key={item.input}
              className={`safetyGateV2__testItem ${item.passed ? 'safetyGateV2__testItem--pass' : 'safetyGateV2__testItem--fail'}`}
            >
              <span>{item.passed ? '✓' : '✕'} {item.input}</span>
              <span>→ {item.actual}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
