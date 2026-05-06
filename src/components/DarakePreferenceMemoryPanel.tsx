import { useState } from 'react';
import { Brain, Copy, Check, RotateCcw } from 'lucide-react';
import {
  loadDarakePreferenceSignals,
  saveDarakePreferenceSignals,
  buildDarakePreferenceProfile,
  formatDarakePreferenceProfileMarkdown,
} from '../utils/darakePreferenceMemory';

type CopyState = 'idle' | 'copied' | 'failed';

export function DarakePreferenceMemoryPanel() {
  const [signals, setSignals] = useState(() => loadDarakePreferenceSignals());
  const [profile, setProfile] = useState(() =>
    buildDarakePreferenceProfile(loadDarakePreferenceSignals())
  );
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleReset() {
    saveDarakePreferenceSignals([]);
    setSignals([]);
    setProfile(buildDarakePreferenceProfile([]));
  }

  function handleRefresh() {
    const fresh = loadDarakePreferenceSignals();
    setSignals(fresh);
    setProfile(buildDarakePreferenceProfile(fresh));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatDarakePreferenceProfileMarkdown(profile));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase36Panel">
      <div className="phase36Hero">
        <Brain />
        <div>
          <p className="eyebrow">Phase 36.1–36.2</p>
          <h3>Darake Preference Memory</h3>
          <p>あなたのだらけ傾向をlocalStorageで覚えます。外部AIは使いません。</p>
        </div>
      </div>

      <div className="phase36SafetyBox">
        🔒 外部APIへの送信は行いません。全データはlocalStorageのみに保存されます。
      </div>

      <div className="phase36Section">
        <h4>学習状態</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`phase36rStatusBadge ${learningEnabled ? 'active' : 'inactive'}`}>
            {learningEnabled ? '✅ 学習有効' : '⏸ 学習停止中'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            シグナル: {signals.length}件
          </span>
        </div>
      </div>

      <div className="phase36Section">
        <h4>だらけ傾向サマリー</h4>
        <div className="phase36SummaryGrid">
          <section>
            <h4>よく無視</h4>
            <p>{profile.oftenIgnoredTypes.length}</p>
          </section>
          <section>
            <h4>よくLater</h4>
            <p>{profile.oftenLaterTypes.length}</p>
          </section>
          <section>
            <h4>よくStop</h4>
            <p>{profile.oftenStoppedTypes.length}</p>
          </section>
          <section>
            <h4>奥へ送ってOK</h4>
            <p>{profile.safeToHideTypes.length}</p>
          </section>
        </div>
      </div>

      {profile.oftenIgnoredTypes.length > 0 && (
        <div className="phase36Section">
          <h4>よく無視するもの</h4>
          <div className="phase36TagList">
            {profile.oftenIgnoredTypes.map((t) => (
              <span key={t} className="phase36Tag">{t}</span>
            ))}
          </div>
        </div>
      )}

      {profile.oftenLaterTypes.length > 0 && (
        <div className="phase36Section">
          <h4>よくLaterにするもの</h4>
          <div className="phase36TagList">
            {profile.oftenLaterTypes.map((t) => (
              <span key={t} className="phase36Tag">{t}</span>
            ))}
          </div>
        </div>
      )}

      {profile.safeToHideTypes.length > 0 && (
        <div className="phase36Section">
          <h4>自動で奥へ送ってよさそうなもの</h4>
          <div className="phase36TagList">
            {profile.safeToHideTypes.map((t) => (
              <span key={t} className="phase36Tag">{t}</span>
            ))}
          </div>
        </div>
      )}

      {profile.shouldSurfaceTypes.length > 0 && (
        <div className="phase36Section">
          <h4>前に出すべきもの</h4>
          <div className="phase36TagList">
            {profile.shouldSurfaceTypes.map((t) => (
              <span key={t} className="phase36Tag">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="phase36Section">
        <h4>おすすめモード</h4>
        <span className="phase36ModeBadge">🎛 {profile.preferredDashboardMode}</span>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>
          {profile.notes}
        </p>
      </div>

      <div className="phase36BtnRow">
        <button className="phase36SmallBtn" onClick={handleRefresh}>
          🔄 更新
        </button>
        <button
          className={`phase36SmallBtn ${learningEnabled ? '' : 'active'}`}
          onClick={() => setLearningEnabled(!learningEnabled)}
        >
          {learningEnabled ? '⏸ 学習を停止' : '▶ 学習を再開'}
        </button>
        <button className="phase36SmallBtn" onClick={handleReset} style={{ color: '#992020' }}>
          <RotateCcw size={13} /> 学習リセット
        </button>
        <button className={`phase36CopyBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} Markdownコピー
        </button>
      </div>

      {signals.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
          まだ学習データがありません。操作を続けると傾向を学習します。
        </p>
      )}
    </div>
  );
}
