import { releaseFirstStartMinimalMode } from '../utils/firstStartMinimalMode';

export function FirstStartAdvancedOpenPanel() {
  return (
    <div className="phase48AdvancedOpen">
      <div className="phase48AdvancedTitle">必要なら、すぐ詳細な管制室へ</div>
      <p className="phase48AdvancedLead">
        管制室を開いて、タスク・今夜進めるもの・朝レポートを見ることもできます。
      </p>
      <button type="button" className="phase48AdvancedButton" onClick={releaseFirstStartMinimalMode}>
        詳細な管制室を開く
      </button>
    </div>
  );
}
