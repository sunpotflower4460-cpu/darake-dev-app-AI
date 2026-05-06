import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  buildInitialFirstLaunchCareState,
  loadFirstLaunchCareState,
  saveFirstLaunchCareState,
  clearFirstLaunchCareState,
  FIRST_LAUNCH_STEPS,
  FIRST_LAUNCH_STEP_LABELS,
} from '../utils/firstLaunchCareOnboarding';
import type { FirstLaunchCareState, FirstLaunchCareStep } from '../utils/firstLaunchCareOnboarding';

function getInitialState(): FirstLaunchCareState {
  return loadFirstLaunchCareState() ?? buildInitialFirstLaunchCareState();
}

const DARAKE_LEVEL_LABELS = {
  'guide-me-gently': 'やさしく案内してほしい',
  'mostly-auto': 'だいたい自動で進めてほしい',
  'maximum-darake': '最大限だらけたい',
};

const STEP_INDEX: Record<FirstLaunchCareStep, number> = {
  welcome: 0,
  'app-seed': 1,
  'auto-level': 2,
  safety: 3,
  ready: 4,
};

export function FirstLaunchCarePanel() {
  const [state, setState] = useState<FirstLaunchCareState>(getInitialState);
  const currentIndex = STEP_INDEX[state.currentStep];

  function update(partial: Partial<FirstLaunchCareState>) {
    const next = { ...state, ...partial };
    setState(next);
    saveFirstLaunchCareState(next);
  }

  function goNext() {
    const nextStep = FIRST_LAUNCH_STEPS[currentIndex + 1];
    if (!nextStep) return;
    if (nextStep === 'ready') {
      update({ currentStep: nextStep, hasCompletedFirstLaunch: true });
    } else {
      update({ currentStep: nextStep });
    }
  }

  function goBack() {
    const prevStep = FIRST_LAUNCH_STEPS[currentIndex - 1];
    if (prevStep) update({ currentStep: prevStep });
  }

  function handleReset() {
    clearFirstLaunchCareState();
    setState(buildInitialFirstLaunchCareState());
  }

  return (
    <div className="flcPanel">
      <span className="flcPhaseTag">Phase 45</span>

      <div className="flcStepIndicator">
        {FIRST_LAUNCH_STEPS.map((step, i) => (
          <div
            key={step}
            className={[
              'flcStepDot',
              i === currentIndex ? 'active' : '',
              i < currentIndex ? 'done' : '',
            ].join(' ')}
          />
        ))}
      </div>

      {state.currentStep === 'welcome' && (
        <div className="flcStepBody">
          <div className="flcHero">
            <div className="flcHeroEmoji">🌱</div>
            <div className="flcHeroTitle">だらけ管制室へようこそ</div>
            <div className="flcHeroSub">
              作りたいアプリを、できるだけ少ない手間で形にします。<br />
              危ない操作は勝手にしません。<br />
              安全な下書きだけ、裏で整えます。
            </div>
          </div>
          <div className="flcBtnRow">
            <button className="flcBtnPrimary" onClick={goNext}>はじめる</button>
          </div>
        </div>
      )}

      {state.currentStep === 'app-seed' && (
        <div className="flcStepBody">
          <div className="flcStepTitle">アプリのことを教えてください</div>

          <label className="flcLabel">アプリ名</label>
          <input
            className="flcInput"
            type="text"
            placeholder="例：ねこ体調メモ"
            value={state.appName}
            onChange={(e) => update({ appName: e.target.value })}
          />

          <label className="flcLabel">どんなアプリ？</label>
          <textarea
            className="flcInput"
            rows={3}
            placeholder="例：猫のごはん・体調・通院を簡単に記録するアプリ"
            value={state.appSeed}
            onChange={(e) => update({ appSeed: e.target.value })}
          />

          <label className="flcLabel">誰に使ってほしい？</label>
          <input
            className="flcInput"
            type="text"
            placeholder="例：猫を飼っている人"
            value={state.targetUser}
            onChange={(e) => update({ targetUser: e.target.value })}
          />

          <div className="flcBtnRow">
            <button className="flcBtnPrimary" onClick={goNext}>次へ</button>
            <button className="flcBtnSecondary" onClick={goBack}>戻る</button>
          </div>
        </div>
      )}

      {state.currentStep === 'auto-level' && (
        <div className="flcStepBody">
          <div className="flcStepTitle">どんな雰囲気で進めますか？</div>
          <div className="flcChoiceRow">
            {(Object.keys(DARAKE_LEVEL_LABELS) as Array<keyof typeof DARAKE_LEVEL_LABELS>).map((level) => (
              <button
                key={level}
                className={`flcChoiceBtn${state.darakeLevel === level ? ' selected' : ''}`}
                onClick={() => update({ darakeLevel: level })}
              >
                {DARAKE_LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
          <div className="flcBtnRow">
            <button className="flcBtnPrimary" onClick={goNext}>次へ</button>
            <button className="flcBtnSecondary" onClick={goBack}>戻る</button>
          </div>
        </div>
      )}

      {state.currentStep === 'safety' && (
        <div className="flcStepBody">
          <div className="flcStepTitle">勝手にやらないこと</div>
          <div className="flcSafetyList">
            {[
              'GitHubに勝手に投稿しません',
              'App Storeに勝手に提出しません',
              'APIキーは保存しません',
              'AI APIは呼びません',
              '危ない操作は人間が確認します',
            ].map((item, i) => (
              <div key={i} className="flcSafetyItem">
                <span className="flcSafetyIcon">✅</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flcBtnRow">
            <button className="flcBtnPrimary" onClick={goNext}>確認しました</button>
            <button className="flcBtnSecondary" onClick={goBack}>戻る</button>
          </div>
        </div>
      )}

      {state.currentStep === 'ready' && (
        <div className="flcStepBody">
          <div className="flcReadyCard">
            <div className="flcReadyTitle">🎉 準備できました</div>
            <div className="flcReadySub">
              次は内容を確認して、ぽん開始パックを作ります。<br />
              {state.appName && <span>アプリ: <strong>{state.appName}</strong></span>}
            </div>
          </div>
          <div className="flcBtnRow">
            <button className="flcBtnPrimary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Check size={16} /> 次へ進む
            </button>
            <button className="flcBtnSecondary" onClick={handleReset}>最初からやり直す</button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#aaa', marginTop: 16 }}>
        {FIRST_LAUNCH_STEP_LABELS[state.currentStep]}
      </div>
    </div>
  );
}
