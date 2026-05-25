export type DarakeNavGroupId =
  | 'home'
  | 'create'
  | 'run'
  | 'watch'
  | 'screenshots'
  | 'submit'
  | 'post-release'
  | 'portfolio'
  | 'templates'
  | 'reports'
  | 'settings'
  | 'first-start';

export type DarakeNavGroup = {
  id: DarakeNavGroupId;
  label: string;
  emoji: string;
  description: string;
};

export const NAV_GROUPS: DarakeNavGroup[] = [
  { id: 'home', label: 'ホーム', emoji: '🏠', description: '今日見るべきものを確認する' },
  { id: 'create', label: 'Create', emoji: '✏️', description: 'Issue・AutoRun・Phase計画を作る' },
  { id: 'run', label: 'Run', emoji: '▶️', description: 'CI・PR・ビルドを監視する' },
  { id: 'watch', label: 'Watch', emoji: '👀', description: 'レビュー・承認状態を監視する' },
  { id: 'screenshots', label: 'Screenshots', emoji: '📸', description: 'スクショ撮影・確認' },
  { id: 'submit', label: 'Submit', emoji: '📦', description: 'App Store提出準備・管制室' },
  { id: 'post-release', label: 'Post-Release', emoji: '🚀', description: '公開後運用・フィードバック' },
  { id: 'portfolio', label: 'Portfolio', emoji: '🗂', description: '複数アプリ管理' },
  { id: 'templates', label: 'Templates', emoji: '🏭', description: 'テンプレ工場・設計書生成' },
  { id: 'reports', label: 'Reports', emoji: '📊', description: 'レポート・完成度確認' },
  { id: 'settings', label: 'Settings', emoji: '⚙️', description: '安全設定・システム設定' },
  { id: 'first-start', label: 'はじめる', emoji: '🌱', description: 'はじめてのアプリ制作' },
];

export function getNavGroupById(id: DarakeNavGroupId): DarakeNavGroup | undefined {
  return NAV_GROUPS.find((g) => g.id === id);
}

export type PanelNavGroupMap = Record<string, DarakeNavGroupId>;

export const PANEL_GROUP_MAP: PanelNavGroupMap = {
  DarakeModePanel: 'home',
  DarakeHomeSummaryPanel: 'home',
  FocusedModePanel: 'home',
  DarakeNavigationBar: 'home',
  IssueDraftPanel: 'create',
  AppDesignInputPanel: 'create',
  FinalCheckPanel: 'create',
  ManualGatePanel: 'create',
  IssueRecordPanel: 'create',
  PhaseQueuePanel: 'create',
  AutoRunPlanPanel: 'create',
  BlueprintGeneratorPanel: 'templates',
  PhasePlanGeneratorPanel: 'templates',
  CloudAgentInstructionGeneratorPanel: 'templates',
  IssueDraftBatchGeneratorPanel: 'templates',
  SavedBlueprintsPanel: 'templates',
  PrCreationPreviewPanel: 'run',
  LowRiskPrCandidatePanel: 'run',
  LowRiskMergeCandidatePanel: 'run',
  CiWatchPanel: 'run',
  PrWatchPanel: 'run',
  ReviewWatchPanel: 'watch',
  ActionPreviewPanel: 'watch',
  Phase7SafetyPanel: 'watch',
  PreviewUrlRecordPanel: 'watch',
  VisionVerifyPanel: 'screenshots',
  ScreenshotJobDraftPanel: 'screenshots',
  ScreenshotPlanExportPanel: 'screenshots',
  ScreenshotRunGatePanel: 'screenshots',
  ScreenshotWorkflowDispatchDraftPanel: 'screenshots',
  ScreenshotWorkflowFileStatusPanel: 'screenshots',
  ScreenshotWorkflowManualRunGuidePanel: 'screenshots',
  ScreenshotDryRunArtifactCheckPanel: 'screenshots',
  DryRunArtifactCheckRecordPanel: 'screenshots',
  ScreenshotCaptureGatePanel: 'screenshots',
  RealCaptureWorkflowDraftPanel: 'screenshots',
  PlaywrightSetupDryRunDraftPanel: 'screenshots',
  PlaywrightSetupWorkflowFileStatusPanel: 'screenshots',
  PlaywrightSetupManualRunGuidePanel: 'screenshots',
  PlaywrightSetupReportRecordPanel: 'screenshots',
  LimitedScreenshotCaptureWorkflowDraftPanel: 'screenshots',
  LimitedScreenshotCaptureWorkflowFileStatusPanel: 'screenshots',
  LimitedScreenshotCaptureManualRunGuidePanel: 'screenshots',
  ScreenshotCaptureManifestRecordPanel: 'screenshots',
  ScreenshotManifestToResultBridgePanel: 'screenshots',
  ScreenshotResultRecordPanel: 'screenshots',
  UiCheckReadinessGatePanel: 'screenshots',
  ScreenshotToUiCheckBridgePanel: 'screenshots',
  UiMachineCheckDraftPanel: 'screenshots',
  UiMachineCheckInputPackPanel: 'screenshots',
  UiCheckResultBridgePanel: 'screenshots',
  UiCheckResultRecordPanel: 'screenshots',
  UiCheckCompletionReportPanel: 'screenshots',
  Phase10ScreenshotUiCompletionReportPanel: 'screenshots',
  NotificationDraftPanel: 'submit',
  NotificationDigestPanel: 'submit',
  ManualGateNotificationTemplatePanel: 'submit',
  AppStoreMetadataDraftPanel: 'submit',
  StoreCopyTemplatePanel: 'submit',
  PrivacyAgeRatingDraftPanel: 'submit',
  AppStoreScreenshotChecklistPanel: 'submit',
  AppStorePrepCompletionReportPanel: 'submit',
  SubmissionControlRoomPanel: 'submit',
  AppStoreConnectInputPackPanel: 'submit',
  AppStoreConnectApiCandidateDraftPanel: 'submit',
  TestFlightPrepChecklistPanel: 'submit',
  FinalSubmissionGatePanel: 'submit',
  SubmitForReviewManualGuidePanel: 'submit',
  AppReviewRejectionRecordPanel: 'submit',
  AppReviewResponseDraftPanel: 'submit',
  RejectionFixIssueDraftPanel: 'submit',
  ResubmissionChecklistPanel: 'submit',
  ReleaseRecordPanel: 'post-release',
  PostReleaseFeedbackPanel: 'post-release',
  FeedbackIssueDraftPanel: 'post-release',
  NextUpdatePlanPanel: 'post-release',
  PostReleaseCompletionReportPanel: 'post-release',
  AppRegistryPanel: 'portfolio',
  PortfolioDashboardPanel: 'portfolio',
  TodaysFocusPanel: 'portfolio',
  CrossAppNotificationDigestPanel: 'portfolio',
  PortfolioCompletionReportPanel: 'portfolio',
  DarakeSafetySettingsPanel: 'settings',
  DarakeDevOsCompletionReportPanel: 'reports',
  StatusPanel: 'reports',
  FuturePanel: 'reports',
  InfoPanel: 'reports',
};
