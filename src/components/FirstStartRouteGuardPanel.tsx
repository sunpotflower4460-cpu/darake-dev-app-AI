import '../phase48FirstStartHardening.css';

export function FirstStartRouteGuardPanel() {
  return (
    <div className="phase48RouteGuard">
      <div className="phase48RouteGuardEmoji">🌱</div>
      <div className="phase48RouteGuardTitle">まずはここだけ</div>
      <p className="phase48RouteGuardLead">
        細かい管制パネルは隠しています。下のカードだけ進めれば、Cloud Agentに貼る指示まで作れます。
      </p>
      <button
        type="button"
        className="phase48RouteGuardButton"
        onClick={() => {
          const nextPanel = document.querySelector('.boundaryShell .panel.statusModePanel:nth-of-type(2)');
          if (nextPanel instanceof HTMLElement) {
            nextPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      >
        下のカードへ進む
      </button>
    </div>
  );
}
