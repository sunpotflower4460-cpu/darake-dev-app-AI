import { useEffect, useState } from 'react';
import { Sliders } from 'lucide-react';
import { FOCUSED_MODES, getFocusedModeById, loadFocusedModeId, saveFocusedModeId } from '../utils/focusedMode';
import type { FocusedModeId } from '../utils/focusedMode';

export function FocusedModePanel() {
  const [modeId, setModeId] = useState<FocusedModeId>(loadFocusedModeId);

  useEffect(() => {
    saveFocusedModeId(modeId);
  }, [modeId]);

  const mode = getFocusedModeById(modeId);

  return (
    <div className="phase18Panel">
      <div className="phase18Hero">
        <Sliders />
        <div>
          <p className="eyebrow">Phase 18.4</p>
          <h3>フォーカスモード / Focused Mode</h3>
          <p>パネルが増えすぎて見づらくなるのを防ぎます。表示するグループを絞ります。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>表示モード設定</strong>
        <p>localStorageキー: darake.focusedMode.v1</p>
      </div>

      <div>
        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#35513d', marginBottom: '10px' }}>現在のモード: <strong>{mode.label}</strong></p>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '12px' }}>{mode.description}</p>
        <div className="focusModeSelector">
          {FOCUSED_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`focusModeSelectorBtn${modeId === m.id ? ' active' : ''}`}
              onClick={() => setModeId(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="phaseInfoBox">
        <strong>このモードで表示されるグループ</strong>
        <ul>
          {mode.navGroups.map((g) => <li key={g}>{g}</li>)}
        </ul>
      </div>
    </div>
  );
}
