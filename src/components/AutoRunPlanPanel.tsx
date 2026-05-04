import { Rocket } from 'lucide-react';
import { autoRunPlanSections } from '../data/autoRunPlan';

export function AutoRunPlanPanel() {
  return (
    <div className="autoRunPlanPanel">
      <div className="autoRunHero">
        <Rocket />
        <div>
          <p className="eyebrow">Phase 8.0</p>
          <h3>一括オート進行モード設計</h3>
          <p>「作りたい」を受け取ったあと、完成間近まで自動で進み、必要な手動項目は最後にまとめるための地図です。</p>
        </div>
      </div>

      <div className="autoRunPrinciple">
        <strong>Batch Gate Mode</strong>
        <p>途中で小さく止まらず、どうしても進めない時だけ止まります。軽微な問題や手動項目は完成間近レポートへまとめます。</p>
      </div>

      <div className="autoRunGrid">
        {autoRunPlanSections.map((section) => (
          <article className={`autoRunCard auto-${section.id}`} key={section.id}>
            <strong>{section.title}</strong>
            <p>{section.detail}</p>
            <div>
              {section.items.map((item) => <span key={item}>{item}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
