import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { loadRemoteRunLink } from '../utils/remoteRunLink';
import { loadDarakeAutopilotState } from '../utils/darakeAutopilotState';
import { loadDarakeLevelSettings } from '../utils/darakeLevelSettings';
import { syncRemoteRunState, testNotification } from '../utils/remoteRunClient';
import type { DarakeRemoteRun } from '../utils/darakeRemoteRun';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export function RemoteAutopilotStatusCard() {
  const [revision, setRevision] = useState(0);
  const [remoteRun, setRemoteRun] = useState<DarakeRemoteRun | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [showSetupDetails, setShowSetupDetails] = useState(false);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const link = useMemo(() => loadRemoteRunLink(), [revision]);
  const autopilotState = useMemo(() => loadDarakeAutopilotState(), [revision]);
  const levelSettings = useMemo(() => loadDarakeLevelSettings(), [revision]);

  const isWakeMeOnly = levelSettings.level === 'wake-me-only-if-needed';
  const isCareful = levelSettings.level === 'careful';

  // Sync on mount and when link changes
  useEffect(() => {
    if (!link) return;

    setSyncStatus('syncing');
    syncRemoteRunState()
      .then((run) => {
        if (run) {
          setRemoteRun(run);
          setSyncStatus('synced');
          setRevision((v) => v + 1);
        } else {
          setSyncStatus('error');
        }
      })
      .catch(() => setSyncStatus('error'));
  }, [link?.runId]);

  async function handleTestTelegram() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await testNotification({ channel: 'telegram' });
      setTestResult(res.ok ? '✅ 通知テストを送信しました' : `❌ ${res.error}`);
    } finally {
      setTestLoading(false);
    }
  }

  async function handleTestWebhook() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await testNotification({ channel: 'webhook' });
      setTestResult(res.ok ? '✅ 通知テストを送信しました' : `❌ ${res.error}`);
    } finally {
      setTestLoading(false);
    }
  }

  // Determine display state
  const isRegistryEnabled = !!link;

  // Don't show if autopilot is not running
  if (!autopilotState || autopilotState.status === 'off' || autopilotState.status === 'idle') {
    return null;
  }

  // No remote link — show "not configured" card
  if (!isRegistryEnabled) {
    return (
      <div className="remoteAutopilotCard remoteAutopilotCard--unconfigured">
        <div className="remoteAutopilotHeader">
          <span className="remoteAutopilotBadge remoteAutopilotBadge--gray">裏巡回未設定</span>
        </div>
        <div className="remoteAutopilotBody">
          <div className="remoteAutopilotTitle">裏巡回はまだ未設定です</div>
          <div className="remoteAutopilotDesc">
            画面を開いている間は確認できます。
            <br />
            画面を閉じても進めたい場合は、Worker側の保存と通知設定が必要です。
          </div>
        </div>
        <button
          type="button"
          className="remoteAutopilotBtnText"
          onClick={() => setShowSetupDetails((v) => !v)}
        >
          {showSetupDetails ? '設定方法を閉じる' : '最初だけ必要な設定を見る'}
        </button>
        {showSetupDetails && <SetupGuideDetails />}
      </div>
    );
  }

  // Error syncing
  if (syncStatus === 'error') {
    return (
      <div className="remoteAutopilotCard remoteAutopilotCard--error">
        <div className="remoteAutopilotHeader">
          <span className="remoteAutopilotBadge remoteAutopilotBadge--red">エラー</span>
        </div>
        <div className="remoteAutopilotBody">
          <div className="remoteAutopilotTitle">裏巡回の状態を取得できませんでした</div>
          <div className="remoteAutopilotDesc">画面内の情報だけ表示しています。</div>
        </div>
      </div>
    );
  }

  // Active run exists — determine display by status
  const runStatus = remoteRun?.status ?? 'active';
  const needsWake = runStatus === 'needs-human' || runStatus === 'merge-candidate' || runStatus === 'blocked';

  if (needsWake) {
    const reason = remoteRun?.lastWakeReason ?? 'Worker側で確認が必要です';
    const prUrl = remoteRun?.prUrl;

    return (
      <div className="remoteAutopilotCard remoteAutopilotCard--wake">
        <div className="remoteAutopilotHeader">
          <span className="remoteAutopilotBadge remoteAutopilotBadge--orange">通知が必要</span>
        </div>
        <div className="remoteAutopilotBody">
          <div className="remoteAutopilotTitle">起きる必要があります</div>
          <div className="remoteAutopilotReason">
            理由：
            <br />
            {reason}
          </div>
          <div className="remoteAutopilotNext">
            次にやること：
            <br />
            <span className="remoteAutopilotAction">
              {runStatus === 'merge-candidate' ? 'PRを開く' : '詳細を確認してください'}
            </span>
          </div>
        </div>
        {prUrl && (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="remoteAutopilotBtnPrimary"
          >
            <ExternalLink size={14} /> PRを開く
          </a>
        )}
      </div>
    );
  }

  // Syncing indicator
  if (syncStatus === 'syncing') {
    return (
      <div className="remoteAutopilotCard remoteAutopilotCard--active">
        <div className="remoteAutopilotHeader">
          <span className="remoteAutopilotBadge remoteAutopilotBadge--blue">裏巡回中</span>
        </div>
        <div className="remoteAutopilotBody">
          <div className="remoteAutopilotTitle">裏で確認中です</div>
          <div className="remoteAutopilotDesc">確認しています...</div>
        </div>
      </div>
    );
  }

  // Active and working silently
  if (isWakeMeOnly) {
    return (
      <div className="remoteAutopilotCard remoteAutopilotCard--active">
        <div className="remoteAutopilotHeader">
          <span className="remoteAutopilotBadge remoteAutopilotBadge--blue">裏巡回中</span>
        </div>
        <div className="remoteAutopilotBody">
          <div className="remoteAutopilotTitle">裏で確認中です</div>
          <div className="remoteAutopilotNext">
            今やること：
            <br />
            <span className="remoteAutopilotAction">何もしなくてOK</span>
          </div>
          <div className="remoteAutopilotNote">止まった時だけ知らせます。</div>
        </div>
        <div className="remoteAutopilotTestRow">
          <button
            type="button"
            className="remoteAutopilotBtnText"
            onClick={() => setShowSetupDetails((v) => !v)}
          >
            {showSetupDetails ? '通知テストを閉じる' : '通知テストを送る'}
          </button>
          {showSetupDetails && (
            <NotificationTestSection
              onTestTelegram={handleTestTelegram}
              onTestWebhook={handleTestWebhook}
              loading={testLoading}
              result={testResult}
            />
          )}
        </div>
      </div>
    );
  }

  // Careful mode — show details
  return (
    <div className="remoteAutopilotCard remoteAutopilotCard--active">
      <div className="remoteAutopilotHeader">
        <span className="remoteAutopilotBadge remoteAutopilotBadge--blue">裏巡回中</span>
      </div>
      <div className="remoteAutopilotBody">
        <div className="remoteAutopilotTitle">裏で確認中です</div>
        <div className="remoteAutopilotNext">
          今やること：
          <br />
          <span className="remoteAutopilotAction">何もしなくてOK</span>
        </div>
        {isCareful && remoteRun && (
          <div className="remoteAutopilotDetails">
            <div className="remoteAutopilotDetailRow">Run ID: {remoteRun.id}</div>
            {remoteRun.lastCheckedAt && (
              <div className="remoteAutopilotDetailRow">
                最終確認：{new Date(remoteRun.lastCheckedAt).toLocaleString('ja-JP')}
              </div>
            )}
            {remoteRun.nextCheckAfter && (
              <div className="remoteAutopilotDetailRow">
                次回確認予定：{new Date(remoteRun.nextCheckAfter).toLocaleString('ja-JP')}
              </div>
            )}
            {remoteRun.issueUrl && (
              <div className="remoteAutopilotDetailRow">
                <a href={remoteRun.issueUrl} target="_blank" rel="noopener noreferrer">
                  Issue を開く
                </a>
              </div>
            )}
            {remoteRun.prUrl && (
              <div className="remoteAutopilotDetailRow">
                <a href={remoteRun.prUrl} target="_blank" rel="noopener noreferrer">
                  PR を開く
                </a>
              </div>
            )}
          </div>
        )}
        <div className="remoteAutopilotNote">止まった時だけ知らせます。</div>
      </div>
      <div className="remoteAutopilotTestRow">
        <button
          type="button"
          className="remoteAutopilotBtnText"
          onClick={() => setShowSetupDetails((v) => !v)}
        >
          {showSetupDetails ? '通知テストを閉じる' : '通知テストを送る'}
        </button>
        {showSetupDetails && (
          <NotificationTestSection
            onTestTelegram={handleTestTelegram}
            onTestWebhook={handleTestWebhook}
            loading={testLoading}
            result={testResult}
          />
        )}
      </div>
    </div>
  );
}

function NotificationTestSection({
  onTestTelegram,
  onTestWebhook,
  loading,
  result,
}: {
  onTestTelegram: () => void;
  onTestWebhook: () => void;
  loading: boolean;
  result: string | null;
}) {
  return (
    <div className="remoteAutopilotTestSection">
      <div className="remoteAutopilotTestDesc">
        止まった時だけ知らせるための通知設定を確認します。
      </div>
      <div className="remoteAutopilotTestBtns">
        <button
          type="button"
          className="remoteAutopilotBtnSecondary"
          onClick={onTestTelegram}
          disabled={loading}
        >
          Telegram テスト
        </button>
        <button
          type="button"
          className="remoteAutopilotBtnSecondary"
          onClick={onTestWebhook}
          disabled={loading}
        >
          Webhook テスト
        </button>
      </div>
      {result && <div className="remoteAutopilotTestResult">{result}</div>}
    </div>
  );
}

function SetupGuideDetails() {
  return (
    <div className="remoteAutopilotSetupGuide">
      <div className="remoteAutopilotSetupTitle">最初だけ設定が必要です</div>
      <div className="remoteAutopilotSetupDesc">
        画面を閉じても自動確認したい場合は、Cloudflare側で以下を設定してください。
      </div>
      <ul className="remoteAutopilotSetupList">
        <li>RUN_REGISTRY_KV</li>
        <li>GITHUB_TOKEN</li>
        <li>DARAKE_RUN_REGISTRY_ENABLED=true</li>
        <li>DARAKE_AUTOPILOT_SCHEDULE_ENABLED=true</li>
        <li>TELEGRAM_BOT_TOKEN</li>
        <li>TELEGRAM_CHAT_ID</li>
      </ul>
      <div className="remoteAutopilotSetupNote">
        Tokenはこの画面には入力しません。
        <br />
        CloudflareのSecretとして設定します。
      </div>
    </div>
  );
}
