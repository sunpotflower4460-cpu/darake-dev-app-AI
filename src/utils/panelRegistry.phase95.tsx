import { PrCiHumanSummaryPanel } from "../components/PrCiHumanSummaryPanel";
import type { PanelRegistryItem } from "./panelRegistry";

export const PANEL_REGISTRY_PHASE95: PanelRegistryItem[] = [
  {
    id: "pr-ci-human-summary",
    label: "PR/CI状態（実データ＋デモ）",
    group: "watch",
    phase: "Phase 103",
    component: <PrCiHumanSummaryPanel />,
    defaultVisible: true,
    priority: 103,
    tags: ["pr", "ci", "summary", "human", "translate", "watch", "preview"],
    kind: "real-data",
  },
];
