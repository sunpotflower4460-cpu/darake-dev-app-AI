import { Command } from 'lucide-react';
import type { DarakeNavGroupId } from '../utils/navigationGroups';
import type { FocusedModeId } from '../utils/focusedMode';
import { loadAppRegistry } from '../utils/appRegistry';
import { useMemo } from 'react';

type Props = {
  activeGroup: DarakeNavGroupId | 'all';
  focusedMode: FocusedModeId;
  totalPanels: number;
  visiblePanels: number;
  onGroupSelect: (group: DarakeNavGroupId | 'all') => void;
  onModeSelect: (mode: FocusedModeId) => void;
};

type ShortcutDef = {
  label: string;
  group: DarakeNavGroupId | 'all';
  mode: FocusedModeId;
};

const SHORTCUTS: ShortcutDef[] = [
  { label: '🌐 全部見る', group: 'all', mode: 'all' },
  { label: '📍 今日だけ', group: 'all', mode: 'today' },
  { label: '📦 提出準備', group: 'submit', mode: 'submission' },
  { label: '📸 スクショ', group: 'screenshots', mode: 'screenshot' },
  { label: '🗂 ポートフォリオ', group: 'portfolio', mode: 'portfolio' },
  { label: '🏭 テンプレ', group: 'templates', mode: 'templates' },
];

export function DarakeTopCommandPanel({
  activeGroup,
  focusedMode,
  totalPanels,
  visiblePanels,
  onGroupSelect,
  onModeSelect,
}: Props) {
  const apps = useMemo(() => loadAppRegistry(), []);
  const blockedApps = apps.filter((a) => a.riskLevel === 'blocked');
  const manualGateApps = apps.filter((a) => a.riskLevel === 'manual-gate');
  const preSubmissionApps = apps.filter((a) => a.lifecycleStage === 'submission-prep');

  const darakeComment =
    blockedApps.length > 0
      ? `⚠️ ${blockedApps.length}件がブロック中です。まず「提出準備」グループを確認しましょう。`
      : manualGateApps.length > 0
        ? `🚪 ${manualGateApps.length}件が手動確認待ちです。`
        : preSubmissionApps.length > 0
          ? `📦 ${preSubmissionApps.length}件が提出直前です！`
          : apps.length === 0
            ? '🌱 まだアプリが登録されていません。Homeグループから始めましょう。'
            : '😌 今は落ち着いています。グループを選んで作業を続けましょう。';

  function handleShortcut(s: ShortcutDef) {
    onGroupSelect(s.group);
    onModeSelect(s.mode);
  }

  const isShortcutActive = (s: ShortcutDef) =>
    activeGroup === s.group && focusedMode === s.mode;

  return (
    <div className="darakeTopCommand">
      <div className="darakeTopCommandHeader">
        <Command />
        <div>
          <h3>だらけ管制室</h3>
          <p>Phase 24 — 統合点検・表示整理・安全監査</p>
        </div>
      </div>

      <div className="darakeTopCommandComment">{darakeComment}</div>

      <div className="darakeTopCommandStats">
        <div className="darakeTopCommandStat">
          <div className="statLabel">表示中</div>
          <div className="statValue">{visiblePanels}</div>
        </div>
        <div className="darakeTopCommandStat">
          <div className="statLabel">全パネル</div>
          <div className="statValue">{totalPanels}</div>
        </div>
        <div className="darakeTopCommandStat">
          <div className="statLabel">グループ</div>
          <div className="statValue" style={{ fontSize: '0.75rem', paddingTop: 2 }}>
            {activeGroup}
          </div>
        </div>
        <div className="darakeTopCommandStat">
          <div className="statLabel">モード</div>
          <div className="statValue" style={{ fontSize: '0.72rem', paddingTop: 2 }}>
            {focusedMode}
          </div>
        </div>
        {blockedApps.length > 0 && (
          <div className="darakeTopCommandStat">
            <div className="statLabel">🔴 blocked</div>
            <div className="statValue warn">{blockedApps.length}</div>
          </div>
        )}
        {manualGateApps.length > 0 && (
          <div className="darakeTopCommandStat">
            <div className="statLabel">🚪 manual</div>
            <div className="statValue warn">{manualGateApps.length}</div>
          </div>
        )}
        {preSubmissionApps.length > 0 && (
          <div className="darakeTopCommandStat">
            <div className="statLabel">📦 submit</div>
            <div className="statValue">{preSubmissionApps.length}</div>
          </div>
        )}
      </div>

      <div>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#35513d', marginBottom: 8 }}>
          クイックナビ
        </p>
        <div className="darakeTopCommandShortcuts">
          {SHORTCUTS.map((s) => (
            <button
              key={s.label}
              type="button"
              className={`darakeTopCommandShortcut${isShortcutActive(s) ? ' active' : ''}`}
              onClick={() => handleShortcut(s)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
