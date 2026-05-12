import type { GentleAppStartForm } from './gentleAppStartForm';
import type { OmakaseStartState } from './omakaseStartState';
import type { AgentRunState } from './agentRunState';
import type { AutoFixLoopState } from './autoFixLoopState';
import type { DarakeAutopilotState } from './darakeAutopilotState';
import type { PostMergeWatchState } from './postMergeWatch';

export type MainBuildFlowStep =
  | 'preset-suggested'
  | 'form-needed'
  | 'setup-needed'
  | 'ready-to-start'
  | 'starting'
  | 'agent-working'
  | 'pr-watching'
  | 'auto-fixing'
  | 'merge-candidate'
  | 'post-merge-watching'
  | 'needs-human'
  | 'blocked'
  | 'done';

export type MainBuildFlowDecision = {
  step: MainBuildFlowStep;
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  detailLabel?: string;
  shouldShowDetails: boolean;
  prUrl?: string;
  issueUrl?: string;
  wakeReason?: string;
  /** Long Cloud Agent instruction for copy fallback (only when Copilot assign failed). */
  fallbackInstruction?: string;
};

export type MainBuildFlowInput = {
  form: GentleAppStartForm | null;
  omakase: OmakaseStartState | null;
  agentRun: AgentRunState | null;
  autoFixLoop: AutoFixLoopState | null;
  autopilot: DarakeAutopilotState | null;
  postMergeWatch: PostMergeWatchState | null;
  repoUrl: string;
  setupOk: boolean | null; // null = not yet loaded
};

export function decideMainBuildFlowStep(input: MainBuildFlowInput): MainBuildFlowDecision {
  const { form, omakase, agentRun, autoFixLoop, autopilot, postMergeWatch, setupOk } = input;

  // ── 1. Post-merge watching ───────────────────────────────────────────────
  if (postMergeWatch && postMergeWatch.status !== 'idle') {
    if (
      postMergeWatch.status === 'needs-human' ||
      postMergeWatch.status === 'deploy-failed' ||
      postMergeWatch.status === 'preview-broken'
    ) {
      return {
        step: 'blocked',
        title: '止まりました',
        message: postMergeWatch.userMessage,
        primaryLabel: postMergeWatch.nextActionLabel,
        shouldShowDetails: true,
        wakeReason: postMergeWatch.userMessage,
      };
    }
    if (
      postMergeWatch.status === 'deploy-success' ||
      postMergeWatch.status === 'preview-ok'
    ) {
      return {
        step: 'done',
        title: 'ここまでできました',
        message:
          'Issue作成、AI作業開始、PR確認まで進みました。\n次にやること：\nPRを確認するか、次のアプリを作り始められます。',
        primaryLabel: '次のアプリを作る',
        shouldShowDetails: false,
      };
    }
    return {
      step: 'post-merge-watching',
      title: '何もしなくてOK',
      message: 'AIがマージ後の状態を確認しています。止まった時だけ知らせます。',
      primaryLabel: '何もしなくてOK',
      shouldShowDetails: false,
    };
  }

  // ── 2. Autopilot-level decisions ─────────────────────────────────────────
  if (autopilot) {
    if (autopilot.status === 'done') {
      return {
        step: 'done',
        title: 'ここまでできました',
        message:
          'Issue作成、AI作業開始、PR確認まで進みました。\n次にやること：\nPRを確認するか、次のアプリを作り始められます。',
        primaryLabel: '次のアプリを作る',
        shouldShowDetails: false,
        prUrl: autopilot.prUrl,
      };
    }

    if (autopilot.status === 'merge-candidate') {
      return {
        step: 'merge-candidate',
        title: 'マージ候補です',
        message: 'PRは問題なさそうです。',
        primaryLabel: 'PRを開く',
        shouldShowDetails: false,
        prUrl: autopilot.prUrl,
      };
    }

    if (autopilot.status === 'needs-human') {
      return {
        step: 'needs-human',
        title: '止まりました',
        message: autopilot.wakeReason
          ? `理由：${autopilot.wakeReason}`
          : '確認が必要です。',
        primaryLabel: autopilot.nextActionLabel || '確認する',
        shouldShowDetails: true,
        wakeReason: autopilot.wakeReason,
        prUrl: autopilot.prUrl,
        issueUrl: autopilot.issueUrl,
      };
    }

    if (autopilot.status === 'blocked' || autopilot.status === 'failed') {
      return {
        step: 'blocked',
        title: '止まりました',
        message: autopilot.wakeReason
          ? `理由：${autopilot.wakeReason}`
          : autopilot.userMessage || '問題が発生しました。',
        primaryLabel: autopilot.nextActionLabel || '確認する',
        shouldShowDetails: true,
        wakeReason: autopilot.wakeReason,
      };
    }

    // Active working states
    if (
      autopilot.status === 'issue-creating' ||
      autopilot.status === 'starting'
    ) {
      return {
        step: 'starting',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
      };
    }

    if (
      autopilot.status === 'agent-working' ||
      autopilot.status === 'watching-pr' ||
      autopilot.status === 'auto-fixing' ||
      autopilot.status === 'waiting-for-checks'
    ) {
      return {
        step: 'agent-working',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
        prUrl: autopilot.prUrl,
        issueUrl: autopilot.issueUrl,
      };
    }
  }

  // ── 3. AutoFixLoop ───────────────────────────────────────────────────────
  if (autoFixLoop) {
    if (
      autoFixLoop.status === 'needs-human' ||
      autoFixLoop.status === 'failed'
    ) {
      return {
        step: 'needs-human',
        title: '止まりました',
        message: autoFixLoop.userMessage,
        primaryLabel: autoFixLoop.nextActionLabel,
        shouldShowDetails: true,
        prUrl: autoFixLoop.prUrl,
      };
    }
    if (autoFixLoop.status === 'merge-candidate') {
      return {
        step: 'merge-candidate',
        title: 'マージ候補です',
        message: 'PRは問題なさそうです。',
        primaryLabel: 'PRを開く',
        shouldShowDetails: false,
        prUrl: autoFixLoop.prUrl,
      };
    }
    if (
      autoFixLoop.status === 'checking' ||
      autoFixLoop.status === 'needs-fix' ||
      autoFixLoop.status === 'fix-instruction-ready' ||
      autoFixLoop.status === 'fix-comment-posted' ||
      autoFixLoop.status === 'waiting-for-agent'
    ) {
      return {
        step: 'auto-fixing',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
        prUrl: autoFixLoop.prUrl,
      };
    }
  }

  // ── 4. AgentRun state ────────────────────────────────────────────────────
  if (agentRun) {
    if (agentRun.status === 'done') {
      return {
        step: 'done',
        title: 'ここまでできました',
        message:
          'Issue作成、AI作業開始、PR確認まで進みました。\n次にやること：\nPRを確認するか、次のアプリを作り始められます。',
        primaryLabel: '次のアプリを作る',
        shouldShowDetails: false,
        prUrl: agentRun.prUrl,
      };
    }
    if (agentRun.status === 'needs-human') {
      return {
        step: 'needs-human',
        title: '止まりました',
        message: agentRun.userMessage,
        primaryLabel: agentRun.nextActionLabel,
        shouldShowDetails: true,
        prUrl: agentRun.prUrl,
        issueUrl: agentRun.issueUrl,
      };
    }
    if (agentRun.status === 'failed') {
      return {
        step: 'blocked',
        title: '止まりました',
        message: agentRun.userMessage,
        primaryLabel: agentRun.nextActionLabel,
        shouldShowDetails: true,
      };
    }
    if (
      agentRun.status === 'issue-created' ||
      agentRun.status === 'assigned-to-agent' ||
      agentRun.status === 'agent-working' ||
      agentRun.status === 'pr-created' ||
      agentRun.status === 'checks-running' ||
      agentRun.status === 'needs-agent-fix' ||
      agentRun.status === 'ready-to-review'
    ) {
      return {
        step: 'agent-working',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
        prUrl: agentRun.prUrl,
        issueUrl: agentRun.issueUrl,
      };
    }
  }

  // ── 5. OmakaseStart state ────────────────────────────────────────────────
  if (omakase) {
    if (omakase.status === 'preparing') {
      return {
        step: 'starting',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
      };
    }
    if (omakase.status === 'blocked' || omakase.status === 'failed') {
      return {
        step: 'blocked',
        title: '止まりました',
        message: `理由：${omakase.userMessage}`,
        primaryLabel: omakase.nextActionLabel,
        shouldShowDetails: true,
        wakeReason: omakase.userMessage,
      };
    }
    if (omakase.status === 'assigned-to-agent') {
      return {
        step: 'agent-working',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
        issueUrl: omakase.issueUrl,
      };
    }
    if (omakase.status === 'cloud-agent-ready' || omakase.status === 'issue-created') {
      return {
        step: 'agent-working',
        title: '何もしなくてOK',
        message: 'AIが作業中です。止まった時だけ知らせます。',
        primaryLabel: '何もしなくてOK',
        shouldShowDetails: false,
        issueUrl: omakase.issueUrl,
        fallbackInstruction: omakase.fallbackInstruction,
      };
    }
  }

  // ── 6. Pre-start decisions ───────────────────────────────────────────────

  // Setup not ready → show setup card
  if (setupOk === false) {
    return {
      step: 'setup-needed',
      title: '最初だけ設定が必要です',
      message:
        'GitHub IssueやAI作業を始めるために、Cloudflare / GitHubの設定が必要です。',
      primaryLabel: '設定を確認する',
      shouldShowDetails: false,
    };
  }

  // No form data at all → suggest preset
  if (!form || (!form.appName.trim() && !form.oneLineIdea.trim())) {
    return {
      step: 'preset-suggested',
      title: '宝地図メモ帳から始めますか？',
      message:
        '断片メモから宝地図を作るアプリを、だらけ管制室で作り始めます。',
      primaryLabel: '宝地図メモ帳で始める',
      secondaryLabel: '自分でフォームに入力する',
      shouldShowDetails: false,
    };
  }

  // Form is filled but not valid (missing key fields)
  if (!form.appName.trim() || !form.oneLineIdea.trim()) {
    return {
      step: 'form-needed',
      title: 'フォームを入力してください',
      message: 'アプリ名とアイデアを入力すると、作り始められます。',
      primaryLabel: 'フォームを開く',
      shouldShowDetails: false,
    };
  }

  // No repo URL yet → form-needed
  if (!input.repoUrl.trim()) {
    return {
      step: 'form-needed',
      title: 'リポジトリURLを入力してください',
      message: 'GitHubリポジトリのURLを設定すると、作り始められます。',
      primaryLabel: 'フォームを開く',
      shouldShowDetails: false,
    };
  }

  // Everything ready
  return {
    step: 'ready-to-start',
    title: '準備できています',
    message: '次にやること：この内容で作り始める',
    primaryLabel: 'この内容で作り始める',
    shouldShowDetails: false,
  };
}
