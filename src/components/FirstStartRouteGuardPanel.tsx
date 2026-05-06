import { useEffect, useMemo, useState } from 'react';
import { buildFirstAppStartMode } from '../utils/firstAppStartMode';
import { loadFirstLaunchCareState } from '../utils/firstLaunchCareOnboarding';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import '../phase48FirstStartHardening.css';

function getActive(): boolean {
  return buildFirstAppStartMode(loadFirstLaunchCareState()?.hasCompletedFirstLaunch === true).enabled;
}

export function FirstStartRouteGuardPanel() {
  const [revision, setRevision] = useState(0);
  const active = useMemo(() => getActive(), [revision]);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  useEffect(() => {
    document.body.classList.toggle('darake-first-start-active', active);
    return () => document.body.classList.remove('darake-first-start-active');
  }, [active]);

  if (!active) {
    return <div className="phase48RouteGuardHidden" aria-hidden="true" />;
  }

  return (
    <div className="phase48RouteGuard">
      <div className="phase48RouteGuardEmoji">🌱</div>
      <div className="phase48RouteGuardTitle">まずはここだけ</div>
      <p className="phase48RouteGuardLead">
        最初は細かい管制パネルを隠しています。アプリ名と一言から、はじめの設計セットまで作れます。
      </p>
      <button type="button" className="phase48RouteGuardButton" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        上から順番に進める
      </button>
    </div>
  );
}
