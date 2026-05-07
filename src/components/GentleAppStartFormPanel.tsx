import {
  buildEmptyGentleAppStartForm,
  loadGentleAppStartForm,
  saveGentleAppStartForm,
  validateGentleAppStartForm,
  FEELING_LABELS,
  PLATFORM_LABELS,
  FIRST_GOAL_LABELS,
  AUTO_PREF_LABELS,
} from '../utils/gentleAppStartForm';
import type { GentleAppStartForm } from '../utils/gentleAppStartForm';
import { loadFirstLaunchCareState } from '../utils/firstLaunchCareOnboarding';
import { loadFirstStartHandoff } from '../utils/firstStartHandoff';
import { saveFirstStartStep } from '../utils/firstStartStep';
import { UI_TEMPLATE_OPTIONS } from '../utils/uiTemplateOptions';
import { useState } from 'react';
import { Check, Save } from 'lucide-react';

function reloadToApplyStep() {
  window.setTimeout(() => window.location.reload(), 30);
}

function mergeHandoffIntoForm(form: GentleAppStartForm): GentleAppStartForm {
  const handoff = loadFirstStartHandoff();
  if (!handoff) return form;

  return {
    ...form,
    appName: form.appName.trim() || handoff.appName,
    oneLineIdea: form.oneLineIdea.trim() || handoff.oneLineIdea,
    targetUser: form.targetUser.trim() || handoff.targetUser,
    platform: form.platform === 'not-sure' ? handoff.platform : form.platform,
    autoPreference: form.autoPreference === 'ask-only-important' ? handoff.autoPreference : form.autoPreference,
  };
}

function mergeOnboardingIntoForm(form: GentleAppStartForm): GentleAppStartForm {
  const handoffMerged = mergeHandoffIntoForm(form);
  const onboarding = loadFirstLaunchCareState();
  if (!onboarding) return handoffMerged;

  const merged: GentleAppStartForm = {
    ...handoffMerged,
    appName: handoffMerged.appName.trim() || onboarding.appName,
    oneLineIdea: handoffMerged.oneLineIdea.trim() || onboarding.appSeed,
    targetUser: handoffMerged.targetUser.trim() || onboarding.targetUser,
  };

  if (merged.platform === 'not-sure') {
    merged.platform = onboarding.platform === 'ios' ? 'iphone' : onboarding.platform === 'web' ? 'web' : 'not-sure';
  }

  if (merged.autoPreference === 'ask-only-important') {
    merged.autoPreference = onboarding.darakeLevel === 'maximum-darake'
      ? 'maximum-darake'
      : onboarding.darakeLevel === 'mostly-auto'
        ? 'do-safe-things-silently'
        : 'ask-only-important';
  }

  return merged;
}

function getInitialForm(): GentleAppStartForm {
  const saved = loadGentleAppStartForm();
  return mergeOnboardingIntoForm(saved ?? buildEmptyGentleAppStartForm());
}

export function GentleAppStartFormPanel() {
  const [form, setForm] = useState<GentleAppStartForm>(getInitialForm);
  const [saved, setSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update(partial: Partial<GentleAppStartForm>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleSave() {
    const normalized = mergeOnboardingIntoForm(form);
    const errors = validateGentleAppStartForm(normalized);
    if (errors.length > 0) {
      setForm(normalized);
      return;
    }
    saveGentleAppStartForm(normalized);
    saveFirstStartStep('pon');
    setForm(normalized);
    setSaved(true);
    reloadToApplyStep();
  }

  const normalizedForValidation = mergeOnboardingIntoForm(form);
  const errors = validateGentleAppStartForm(normalizedForValidation);

  return (
    <div className="gasPanel">
      <div className="gasHeader">
        <span className="gasPhaseTag">アプリ確認</span>
        <strong className="gasTitle">作りたいアプリを確認してください</strong>
      </div>

      <div className="gasSection">
        <label className="gasLabel">アプリ名 <span className="gasRequired">*</span></label>
        <input
          className="gasInput"
          type="text"
          placeholder="例：ねこ体調メモ"
          value={form.appName}
          onChange={(e) => update({ appName: e.target.value })}
        />

        <label className="gasLabel">どんなアプリ？ <span className="gasRequired">*</span></label>
        <textarea
          className="gasInput"
          rows={3}
          placeholder="例：猫のごはん・体調・通院を簡単に記録する"
          value={form.oneLineIdea}
          onChange={(e) => update({ oneLineIdea: e.target.value })}
        />

        <label className="gasLabel">誰に使ってほしい？</label>
        <input
          className="gasInput"
          type="text"
          placeholder="例：猫を飼っている人"
          value={form.targetUser}
          onChange={(e) => update({ targetUser: e.target.value })}
        />
      </div>

      <div className="gasSection">
        <label className="gasLabel">見た目のテンプレート</label>
        <div className="gasTemplateGrid">
          {UI_TEMPLATE_OPTIONS.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`gasTemplateBtn${form.uiTemplate === template.id ? ' selected' : ''}`}
              onClick={() => update({ uiTemplate: template.id })}
            >
              <span className="gasTemplateShort">{template.shortLabel}</span>
              <span className="gasTemplateLabel">{template.label}</span>
              <span className="gasTemplateDescription">{template.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gasSection">
        <label className="gasLabel">雰囲気</label>
        <div className="gasChoiceRow">
          {(Object.keys(FEELING_LABELS) as Array<GentleAppStartForm['mainFeeling']>).map((f) => (
            <button
              key={f}
              type="button"
              className={`gasChoiceBtn${form.mainFeeling === f ? ' selected' : ''}`}
              onClick={() => update({ mainFeeling: f })}
            >
              {FEELING_LABELS[f]}
            </button>
          ))}
        </div>

        <label className="gasLabel">どこで動かす？</label>
        <div className="gasChoiceRow">
          {(Object.keys(PLATFORM_LABELS) as Array<GentleAppStartForm['platform']>).map((p) => (
            <button
              key={p}
              type="button"
              className={`gasChoiceBtn${form.platform === p ? ' selected' : ''}`}
              onClick={() => update({ platform: p })}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>

        <label className="gasLabel">どこまで作りたい？</label>
        <div className="gasChoiceRow">
          {(Object.keys(FIRST_GOAL_LABELS) as Array<GentleAppStartForm['firstGoal']>).map((g) => (
            <button
              key={g}
              type="button"
              className={`gasChoiceBtn${form.firstGoal === g ? ' selected' : ''}`}
              onClick={() => update({ firstGoal: g })}
            >
              {FIRST_GOAL_LABELS[g]}
            </button>
          ))}
        </div>

        <label className="gasLabel">自動化はどのくらい？</label>
        <div className="gasChoiceRow">
          {(Object.keys(AUTO_PREF_LABELS) as Array<GentleAppStartForm['autoPreference']>).map((a) => (
            <button
              key={a}
              type="button"
              className={`gasChoiceBtn${form.autoPreference === a ? ' selected' : ''}`}
              onClick={() => update({ autoPreference: a })}
            >
              {AUTO_PREF_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="gasAdvancedToggle"
        onClick={() => setShowAdvanced((v) => !v)}
      >
        {showAdvanced ? '▲ 詳細を閉じる' : '▼ もう少し詳しく書く（任意）'}
      </button>

      {showAdvanced && (
        <div className="gasSection">
          <label className="gasLabel">絶対に入れること</label>
          <textarea
            className="gasInput"
            rows={2}
            placeholder="例：記録の日時を必ず保存する"
            value={form.mustHave}
            onChange={(e) => update({ mustHave: e.target.value })}
          />

          <label className="gasLabel">絶対にやらないこと</label>
          <textarea
            className="gasInput"
            rows={2}
            placeholder="例：ログイン機能はまだ不要"
            value={form.mustNotDo}
            onChange={(e) => update({ mustNotDo: e.target.value })}
          />

          <label className="gasLabel">メモ（自由）</label>
          <textarea
            className="gasInput"
            rows={3}
            placeholder="例：宝地図の見た目は明るく幻想的にしたい"
            value={form.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </div>
      )}

      {errors.length > 0 && (
        <div className="gasErrorBox">
          {errors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
        </div>
      )}

      <div className="gasBtnRow">
        <button
          type="button"
          className="gasBtnPrimary"
          onClick={handleSave}
          disabled={errors.length > 0}
        >
          {saved ? <><Check size={16} /> 保存しました</> : <><Save size={16} /> これで進める</>}
        </button>
      </div>
    </div>
  );
}
