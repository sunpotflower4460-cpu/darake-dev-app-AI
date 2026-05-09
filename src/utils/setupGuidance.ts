export type SetupGuidanceKind =
  | "github-token"
  | "issue-create-enabled"
  | "allowed-repos"
  | "run-registry-kv"
  | "run-registry-enabled"
  | "autopilot-schedule-enabled"
  | "telegram-token"
  | "telegram-chat-id"
  | "webhook-url"
  | "pr-merge-enabled"
  | "unknown";

export type SetupGuidanceStep = {
  title: string;
  description: string;
  copyText?: string;
  warning?: string;
};

export type SetupGuidance = {
  kind: SetupGuidanceKind;
  title: string;
  shortMessage: string;
  nextActionLabel: string;
  steps: SetupGuidanceStep[];
  dangerLevel: "safe" | "careful" | "secret";
};
