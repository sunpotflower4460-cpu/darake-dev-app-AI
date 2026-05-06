import {
  buildEmptyGentleAppStartForm,
  loadGentleAppStartForm,
  saveGentleAppStartForm,
  validateGentleAppStartForm,
  formatGentleAppStartFormMarkdown,
  FEELING_LABELS,
  PLATFORM_LABELS,
  FIRST_GOAL_LABELS,
  AUTO_PREF_LABELS,
} from '../utils/gentleAppStartForm';
import type { GentleAppStartForm } from '../utils/gentleAppStartForm';
import { useState } from 'react';
import { Copy, Check, Save } from 'lucide-react';

function getInitialForm(): GentleAppStartForm {
  return loadGentleAppStartForm() ?? buildEmptyGentleAppStartForm();
}

export function GentleAppStartFormPanel() {
  const [form, setForm] = useState<GentleAppStartForm>(getInitialForm);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update(partial: Partial<GentleAppStartForm>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleSave() {
    const errors = validateGentleAppStartForm(form);
    if (errors.length > 0) return;
    saveGentleAppStartForm(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatGentleAppStartFormMarkdown(form));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const errors = validateGentleAppStartForm(form);

  return (
    <div className="gasPanel">
      <div className="gasHeader">
        <span className="gasPhaseTag">Phase 46</span>
        <strong className="gasTitle">作りたいアプリを教えてください</strong>
      </div>

      {/* Section 1: Basic info */}
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

      {/* Section 2: Style */}
      <div className="gasSection">
        <label className="gasLabel">雰囲気</label>
        <div className="gasChoiceRow">
          {(Object.keys(FEELING_LABELS) as Array<GentleAppStartForm['mainFeeling']>).map((f) => (
            <button
              key={f}
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
              className={`gasChoiceBtn${form.autoPreference === a ? ' selected' : ''}`}
              onClick={() => update({ autoPreference: a })}
            >
              {AUTO_PREF_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Advanced (optional) */}
      <button
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
            placeholder="例：猫の写真を貼れると嬉しい"
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
          className="gasBtnPrimary"
          onClick={handleSave}
          disabled={errors.length > 0}
        >
          {saved ? <><Check size={16} /> 保存しました</> : <><Save size={16} /> 保存</>}
        </button>
        <button className="gasBtnSecondary" onClick={handleCopy}>
          {copied ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Markdownコピー</>}
        </button>
      </div>
    </div>
  );
}
