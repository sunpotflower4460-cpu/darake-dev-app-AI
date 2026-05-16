import type { SettingsHealthResponse } from './settingsHealth';
import type { SetupGuidance } from './setupGuidance';
import { DARAKE_SETUP_LINKS } from './darakeSetupLinks';

const GITHUB_TOKEN_GUIDANCE: SetupGuidance = {
  kind: 'github-token',
  title: 'WORKER_GITHUB_TOKENが必要です',
  shortMessage: 'GitHub側に登録すると、Cloudflare SetupがWorkerのGITHUB_TOKENへ同期します。',
  nextActionLabel: 'GitHub SecretsにWORKER_GITHUB_TOKENを登録してCloudflare Setupを実行する',
  dangerLevel: 'secret',
  steps: [
    {
      title: '1. GitHubでfine-grained tokenを作る',
      description: 'GitHub → Settings → Developer settings → Fine-grained tokens で新しいTokenを作成します。',
    },
    {
      title: '2. 対象リポジトリだけ許可する',
      description: 'Repository access は "Only select repositories" で必要なリポジトリのみを指定してください。',
    },
    {
      title: '3. Issues: write を付ける',
      description: 'Permissions → Issues → "Read and write" を設定します。',
    },
    {
      title: '4. 必要に応じてPull requests / Contents の読み取りを付ける',
      description: '最小権限の原則で、必要なものだけ許可してください。',
    },
    {
      title: '5. GitHub SecretsにWORKER_GITHUB_TOKENとして保存する',
      description: 'Tokenをこの画面やlocalStorageには貼らず、GitHubのActions Secret登録ページに保存します。',
      copyText: 'WORKER_GITHUB_TOKEN',
      warning: 'Cloudflareへ直接GITHUB_TOKENを入れず、GitHub側のWORKER_GITHUB_TOKENから同期してください。',
    },
    {
      title: '6. Cloudflare Setupを実行する',
      description: 'GitHub ActionsのCloudflare Setupを実行すると、Worker側のGITHUB_TOKENへ自動同期されます。',
      copyText: DARAKE_SETUP_LINKS.cloudflareSetupWorkflow,
    },
  ],
};

const ISSUE_CREATE_ENABLED_GUIDANCE: SetupGuidance = {
  kind: 'issue-create-enabled',
  title: 'Issue作成が無効です',
  shortMessage: 'wrangler.tomlには設定済みです。Cloudflare Setupで反映します。',
  nextActionLabel: 'Cloudflare Setupを実行する',
  dangerLevel: 'safe',
  steps: [
    {
      title: 'Cloudflare Setupを実行する',
      description: 'GitHub ActionsのCloudflare Setupを実行すると、wrangler.tomlのGITHUB_ISSUE_CREATE_ENABLED=trueがWorkerへ反映されます。',
      copyText: DARAKE_SETUP_LINKS.cloudflareSetupWorkflow,
    },
  ],
};

const ALLOWED_REPOS_GUIDANCE: SetupGuidance = {
  kind: 'allowed-repos',
  title: '許可リポジトリを設定してください',
  shortMessage: 'だらけ管制室が操作してよいGitHubリポジトリだけを指定します。',
  nextActionLabel: 'GITHUB_ALLOWED_REPOSを設定する',
  dangerLevel: 'careful',
  steps: [
    {
      title: '環境変数に許可リポジトリを列挙する',
      description: 'カンマ区切りで "owner/repo" 形式のリポジトリ名を指定します。',
      copyText: 'GITHUB_ALLOWED_REPOS=sunpotflower4460-cpu/darake-dev-app-AI,sunpotflower4460-cpu/treasure-map-memo',
      warning: '許可リポジトリを空にすると制限が弱くなるため、実運用では必ず設定してください。',
    },
  ],
};

const RUN_REGISTRY_KV_GUIDANCE: SetupGuidance = {
  kind: 'run-registry-kv',
  title: '裏巡回用の保存場所が必要です',
  shortMessage: '画面を閉じても状態を見守るには、Cloudflare KV namespaceが必要です。',
  nextActionLabel: 'KV namespaceを作りwrangler.tomlに追加する',
  dangerLevel: 'safe',
  steps: [
    {
      title: '1. CloudflareでKV namespaceを作る',
      description: 'Cloudflare Dashboard → Workers & Pages → KV → "Create namespace" でnamespaceを作成します。',
      copyText: 'npx wrangler kv namespace create RUN_REGISTRY_KV',
    },
    {
      title: '2. wrangler.tomlにbindingを追加する',
      description: '作成したnamespaceのIDをwrangler.tomlに追記します。',
      copyText: '[[kv_namespaces]]\nbinding = "RUN_REGISTRY_KV"\nid = "<作成したnamespaceのID>"',
    },
    {
      title: '3. DARAKE_RUN_REGISTRY_ENABLED=true を設定する',
      description: '環境変数でKV機能を有効にします。',
      copyText: 'DARAKE_RUN_REGISTRY_ENABLED=true',
    },
  ],
};

const RUN_REGISTRY_ENABLED_GUIDANCE: SetupGuidance = {
  kind: 'run-registry-enabled',
  title: '裏巡回機能がOFFです',
  shortMessage: '環境変数を設定して、KVによる裏巡回を有効にしてください。',
  nextActionLabel: 'DARAKE_RUN_REGISTRY_ENABLED=true を設定する',
  dangerLevel: 'safe',
  steps: [
    {
      title: '環境変数を設定する',
      description: 'Cloudflare Workerの環境変数に以下を追加します。',
      copyText: 'DARAKE_RUN_REGISTRY_ENABLED=true',
    },
  ],
};

const AUTOPILOT_SCHEDULE_ENABLED_GUIDANCE: SetupGuidance = {
  kind: 'autopilot-schedule-enabled',
  title: '定期実行がOFFです',
  shortMessage: 'Workerの定期実行（Cron Trigger）を有効にしてください。',
  nextActionLabel: 'DARAKE_AUTOPILOT_SCHEDULE_ENABLED=true を設定する',
  dangerLevel: 'safe',
  steps: [
    {
      title: '環境変数を設定する',
      description: 'Cloudflare Workerの環境変数に以下を追加します。',
      copyText: 'DARAKE_AUTOPILOT_SCHEDULE_ENABLED=true',
    },
    {
      title: 'wrangler.tomlでCron Triggerを設定する（任意）',
      description: 'wrangler.tomlにCronスケジュールを追記すると、定期実行間隔を制御できます。',
      copyText: '[triggers]\ncrons = ["0 * * * *"]',
    },
  ],
};

const TELEGRAM_TOKEN_GUIDANCE: SetupGuidance = {
  kind: 'telegram-token',
  title: 'Telegram Bot Tokenが必要です',
  shortMessage: 'Telegram通知を受け取るには、Bot TokenとChat IDの両方が必要です。',
  nextActionLabel: 'TELEGRAM_BOT_TOKENをCloudflare Secretに設定する',
  dangerLevel: 'secret',
  steps: [
    {
      title: '1. @BotFather でBotを作成する',
      description: 'TelegramでBotFatherに話しかけ、/newbot でBotを作成するとTokenが発行されます。',
    },
    {
      title: '2. Cloudflare SecretにTELEGRAM_BOT_TOKENとして保存する',
      description: 'Tokenをこの画面やlocalStorageには貼らないでください。',
      copyText: 'npx wrangler secret put TELEGRAM_BOT_TOKEN',
      warning: 'TokenをこのアプリのUI画面やlocalStorageに貼らないでください。',
    },
  ],
};

const TELEGRAM_CHAT_ID_GUIDANCE: SetupGuidance = {
  kind: 'telegram-chat-id',
  title: 'Telegram Chat IDが必要です',
  shortMessage: 'どのチャットに通知を送るか、Chat IDで指定してください。',
  nextActionLabel: 'TELEGRAM_CHAT_IDを環境変数に設定する',
  dangerLevel: 'careful',
  steps: [
    {
      title: 'Chat IDを調べる',
      description: '@userinfobot などにメッセージを送ると自分のChat IDを確認できます。',
    },
    {
      title: '環境変数に設定する',
      description: 'Cloudflare Workerの環境変数（vars）に以下を追加します。',
      copyText: 'TELEGRAM_CHAT_ID=<あなたのChat ID>',
    },
  ],
};

const WEBHOOK_URL_GUIDANCE: SetupGuidance = {
  kind: 'webhook-url',
  title: 'Webhook通知が未設定です（任意）',
  shortMessage: 'Webhook URLを設定すると、SlackなどへもPush通知を送れます。',
  nextActionLabel: 'NOTIFICATION_WEBHOOK_URLを環境変数に設定する（省略可）',
  dangerLevel: 'careful',
  steps: [
    {
      title: '環境変数に設定する',
      description: 'Cloudflare Workerの環境変数に以下を追加します（省略しても問題ありません）。',
      copyText: 'NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/...',
    },
  ],
};

const PR_MERGE_ENABLED_GUIDANCE: SetupGuidance = {
  kind: 'pr-merge-enabled',
  title: '自動マージがOFFです',
  shortMessage: '自動マージを有効にすると、条件を満たしたPRを自動でマージできます。',
  nextActionLabel: 'GITHUB_AGENT_ASSIGN_ENABLED=true を設定してPRマージを有効化する',
  dangerLevel: 'careful',
  steps: [
    {
      title: '環境変数を設定する',
      description: 'Cloudflare Workerの環境変数に以下を追加します。',
      copyText: 'GITHUB_AGENT_ASSIGN_ENABLED=true',
    },
  ],
};

export function buildSetupGuidanceFromHealth(
  health: SettingsHealthResponse,
): SetupGuidance[] {
  const result: SetupGuidance[] = [];

  if (!health.github.tokenConfigured) {
    result.push(GITHUB_TOKEN_GUIDANCE);
  }

  if (!health.github.issueCreateEnabled) {
    result.push(ISSUE_CREATE_ENABLED_GUIDANCE);
  }

  if (!health.github.repoAllowlistConfigured) {
    result.push(ALLOWED_REPOS_GUIDANCE);
  }

  if (!health.github.agentAssignEnabled) {
    result.push(PR_MERGE_ENABLED_GUIDANCE);
  }

  if (!health.kv.configured) {
    result.push(RUN_REGISTRY_KV_GUIDANCE);
  }

  if (!health.kv.runRegistryEnabled) {
    result.push(RUN_REGISTRY_ENABLED_GUIDANCE);
  }

  if (!health.notifications.telegramConfigured) {
    result.push(TELEGRAM_TOKEN_GUIDANCE);
    result.push(TELEGRAM_CHAT_ID_GUIDANCE);
  }

  if (!health.notifications.webhookConfigured) {
    result.push(WEBHOOK_URL_GUIDANCE);
  }

  if (!health.cron.scheduleEnabled) {
    result.push(AUTOPILOT_SCHEDULE_ENABLED_GUIDANCE);
  }

  return result;
}
