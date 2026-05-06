import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { buildAppStoreConnectApiCandidateDraft } from '../utils/appStoreConnectApiCandidateDraft';

export function AppStoreConnectApiCandidateDraftPanel() {
  const draft = useMemo(() => buildAppStoreConnectApiCandidateDraft(), []);

  return (
    <div className="apiCandidateDraftPanel">
      <div className="apiCandidateDraftHero">
        <AlertTriangle />
        <div>
          <p className="eyebrow">Phase 13.3</p>
          <h3>App Store Connect API 候補 下書き</h3>
          <p>将来的なAPI連携の参考メモです。このPhaseではAPIを一切呼びません。</p>
        </div>
      </div>

      <div className="apiCandidateDraftBlockBox">
        <strong>🔴 このPhaseではAPIを呼びません</strong>
        <ul>
          <li>APIキーはこのアプリに入力しません（入力欄はありません）</li>
          <li>Submit for ReviewのAPI自動実行は禁止です</li>
          <li>APIキーはApple Developer / CI secret側で人間が管理します</li>
          <li>本番データへの書き込みは人間の承認が必要です</li>
        </ul>
      </div>

      <div className="apiCandidateDraftSection">
        <strong>可能性のあるAPI作業（将来の参考）</strong>
        <ul>
          {draft.possibleOperations.map((op) => <li key={op}>{op}</li>)}
        </ul>
      </div>

      <div className="apiCandidateDraftSection">
        <strong>必要な手動セットアップ</strong>
        <ul>
          {draft.requiredManualSetup.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>

      <div className="apiCandidateDraftBlockedSection">
        <strong>ブロック条件</strong>
        <ul>
          {draft.blockedConditions.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      <div className="apiCandidateDraftSafetyBox">
        <strong>安全方針</strong>
        <ul>
          {draft.safetyNotes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </div>
    </div>
  );
}
