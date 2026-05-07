import { useEffect, useMemo, useState } from 'react';
import {
  loadDarakeLevelSettings,
  saveDarakeLevelSettings,
  DARAKE_LEVEL_LABELS,
} from '../utils/darakeLevelSettings';
import type { DarakeLevel } from '../utils/darakeLevelSettings';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

const LEVELS: DarakeLevel[] = [
  'careful',
  'important-only',
  'mostly-sleeping',
  'wake-me-only-if-needed',
];

export function DarakeLevelPanel() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const { level } = useMemo(() => loadDarakeLevelSettings(), [revision]);

  function handleSelect(l: DarakeLevel) {
    saveDarakeLevelSettings(l);
    setRevision((v) => v + 1);
  }

  return (
    <div className="darakeLvPanel">
      <div className="darakeLvTitle">どれくらい見たいですか？</div>
      <div className="darakeLvBtnRow">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            className={`darakeLvBtn${l === level ? ' darakeLvBtnActive' : ''}`}
            onClick={() => handleSelect(l)}
          >
            {l === level ? '✅ ' : ''}{DARAKE_LEVEL_LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
