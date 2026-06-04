import '../styles/darakePanelBadge.css';
import { PANEL_KIND_INFO, type PanelKind } from '../utils/darakePanelKinds';

type Props = {
  kinds: PanelKind[];
};

export function DarakePanelBadge({ kinds }: Props) {
  if (kinds.length === 0) return null;
  return (
    <div className="darakePanelBadge__row">
      {kinds.map((kind) => {
        const info = PANEL_KIND_INFO[kind];
        return (
          <span
            key={kind}
            className="darakePanelBadge__badge"
            style={{ color: info.color, background: info.bg }}
          >
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
