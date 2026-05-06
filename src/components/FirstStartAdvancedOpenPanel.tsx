import { releaseFirstStartMinimalMode } from '../utils/firstStartMinimalMode';

export function FirstStartAdvancedOpenPanel() {
  return (
    <div className="phase48AdvancedOpen">
      <div className="phase48AdvancedTitle">ここから先は、見なくても大丈夫です</div>
      <p className="phase48AdvancedLead">
        まずはCloud Agentに指示を貼ればOKです。細かい管制パネルは必要になった時だけ開けます。
      </p>
      <button type="button" className="phase48AdvancedButton" onClick={releaseFirstStartMinimalMode}>
        詳細な管制室を開く
      </button>
    </div>
  );
}
