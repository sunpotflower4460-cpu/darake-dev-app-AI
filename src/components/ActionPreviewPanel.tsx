import { Eye } from 'lucide-react';
import { actionPreviewItems } from '../data/actionPreview';

const modeLabel = {
  'preview-only': '表示のみ',
  'manual-confirm': '確認して停止',
  blocked: '必ず停止',
};

export function ActionPreviewPanel() {
  return (
    <div className="actionPreviewPanel">
      <div className="actionPreviewHero">
        <Eye />
        <div>
          <p className="eyebrow">Phase 7.1</p>
          <h3>実行前プレビュー</h3>
          <p>Issue作成、PR作成、マージなどの書き込み操作は、実行前に内容と安全条件を1枚で確認します。</p>
        </div>
      </div>

      <div className="actionPreviewGrid">
        {actionPreviewItems.map((item) => (
          <article className={`actionPreviewCard preview-${item.mode}`} key={item.id}>
            <div>
              <strong>{item.label}</strong>
              <span>{modeLabel[item.mode]}</span>
            </div>
            <p>{item.summary}</p>
            <ul>
              {item.checks.map((check) => <li key={check}>{check}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
