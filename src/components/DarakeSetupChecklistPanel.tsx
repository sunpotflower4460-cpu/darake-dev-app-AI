import { useCallback, useState } from 'react';
import { fetchSetupStatus } from '../utils/setupStatusClient';
import type { SetupStatusResponse } from '../utils/setupStatusClient';

type CheckItem = {
  key: string;
  label: string;
  ok: boolean;
  hint?: string;
};

type CheckGroup = {
  title: string;
  items: CheckItem[];
};

function buildGroups(data: SetupStatusResponse): CheckGroup[] {
  return [
    {
      title: 'GitHub Issue作成',
      items: [
        {
          key: 'github-token',
          label: 'Worker GITHUB_TOKEN同期',
          ok: data.githubToken === 'set',
          hint: data.githubToken === 'missing'
            ? 'GitHub SecretsにWORKER_GITHUB_TOKENを登録して、Cloudflare Setupを実行してください。この画面にはTokenを入力しません。'
            : undefined,
        },
        {
          key: 'issue-create-enabled',
          label: 'GITHUB_ISSUE_CREATE_ENABLED',
          ok: data.githubIssueCreateEnabled,
          hint: !data.githubIssueCreateEnabled ? 'Cloudflare Setupを実行して、wrangler.tomlのGITHUB_ISSUE_CREATE_ENABLED=trueを反映してください' : undefined,
        },
        {
          key: 'allowed-repos',
          label: '許可リポジトリ',
          ok: data.allowedReposConfigured,
          hint: !data.allowedReposConfigured ? 'GITHUB_ALLOWED_REPOS に対象リポジトリを設定してください' : undefined,
        },
      ],
    },
    {
      title: '裏巡回',
      items: [
        {
          key: 'run-registry-kv',
          label: 'RUN_REGISTRY_KV',
          ok: data.runRegistryKvBound,
          hint: !data.runRegistryKvBound
            ? '画面を閉じても裏で確認するには、RUN_REGISTRY_KV の設定が必要です。'
            : undefined,
        },
        {
          key: 'run-registry-enabled',
          label: 'DARAKE_RUN_REGISTRY_ENABLED',
          ok: data.runRegistryEnabled,
          hint: !data.runRegistryEnabled ? 'DARAKE_RUN_REGISTRY_ENABLED=true を設定してください' : undefined,
        },
      ],
    },
    {
      title: '通知',
      items: [
        {
          key: 'telegram',
          label: 'Telegram通知',
          ok: data.telegramConfigured,
          hint: !data.telegramConfigured ? 'TELEGRAM_BOT_TOKEN と TELEGRAM_CHAT_ID を設定してください' : undefined,
        },
        {
          key: 'webhook',
          label: 'Webhook通知',
          ok: data.webhookConfigured,
          hint: !data.webhookConfigured ? 'NOTIFICATION_WEBHOOK_URL を設定してください（任意）' : undefined,
        },
      ],
    },
    {
      title: '自動マージ',
      items: [
        {
          key: 'pr-merge',
          label: 'GITHUB_PR_MERGE_ENABLED',
          ok: data.githubPrMergeEnabled,
          hint: !data.githubPrMergeEnabled ? 'GITHUB_PR_MERGE_ENABLED=true で自動マージが有効になります（任意）' : undefined,
        },
      ],
    },
  ];
}

export function DarakeSetupChecklistPanel() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SetupStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSetupStatus();
      setData(result);
      setOpen(true);
    } catch {
      setError('設定状態の確認に失敗しました。Workerへの接続を確認してください。');
    } finally {
      setLoading(false);
    }
  }, []);

  const groups = data ? buildGroups(data) : [];
  const hasMissing = groups.some((g) => g.items.some((i) => !i.ok));

  return (
    <div className="darakeSetupChecklist">
      <div className="darakeSetupChecklist__title">最初だけ必要な設定</div>
      <div className="darakeSetupChecklist__subtitle">
        Cloudflare / GitHub の設定状態を確認します
      </div>

      {!data && !loading && (
        <button type="button" className="darakeSetupChecklist__refreshBtn" onClick={handleFetch}>
          設定状態を確認する
        </button>
      )}

      {loading && <div>確認中...</div>}

      {error && (
        <>
          <div className="darakeSetupChecklist__error">{error}</div>
          <button type="button" className="darakeSetupChecklist__refreshBtn" onClick={handleFetch}>
            再試行
          </button>
        </>
      )}

      {data && !loading && (
        <>
          {hasMissing && (
            <div style={{ fontSize: 13, color: '#d69e2e', marginBottom: 8 }}>
              最初だけ設定が必要です
            </div>
          )}
          {!hasMissing && (
            <div style={{ fontSize: 13, color: '#38a169', marginBottom: 8 }}>
              ✅ すべての設定が揃っています
            </div>
          )}

          <button
            type="button"
            className="darakeSetupChecklist__toggleBtn"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '設定詳細を閉じる' : '設定詳細を見る'}
          </button>

          {open && (
            <>
              {groups.map((group) => (
                <div key={group.title} className="darakeSetupChecklist__group">
                  <div className="darakeSetupChecklist__groupTitle">{group.title}</div>
                  {group.items.map((item) => (
                    <div
                      key={item.key}
                      className={`darakeSetupChecklist__item${item.ok ? '' : ' darakeSetupChecklist__item--missing'}`}
                    >
                      <span className="darakeSetupChecklist__icon">{item.ok ? '✅' : '⬜'}</span>
                      <div>
                        <div className="darakeSetupChecklist__label">{item.label}</div>
                        {item.hint && <div className="darakeSetupChecklist__hint">{item.hint}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="darakeSetupChecklist__note">
                ※ TokenやSecretの値はこの画面には表示されません。set / missing のみ確認します。
              </div>

              <button
                type="button"
                className="darakeSetupChecklist__toggleBtn"
                style={{ marginTop: 8 }}
                onClick={handleFetch}
              >
                再確認
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
