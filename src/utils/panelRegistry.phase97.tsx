import { PreviewDeployStatusPanel } from "../components/PreviewDeployStatusPanel";
import type { PanelRegistryItem } from "./panelRegistry";

export const PANEL_REGISTRY_PHASE97: PanelRegistryItem[] = [
  {
    id: "preview-deploy-status",
    label: "Preview/Deploy 実データ＋手動メモ",
    group: "watch",
    phase: "Phase 104",
    component: <PreviewDeployStatusPanel />,
    defaultVisible: false,
    priority: 104,
    tags: ["preview", "deploy", "status", "version", "watch", "real-data"],
    kind: "real-data",
  },
];
