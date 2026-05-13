import { DARAKE_SETUP_LINKS } from '../utils/darakeSetupLinks';

export function DarakeInitialSetupChecklistPanel() {
  return (
    <div className="darakeHumanOnePage__repoFix" aria-label="だらけ初期設定チェックリスト">
      <div className="darakeHumanOnePage__repoFixHeader">
        <strong>だらけ初期設定チェックリスト</strong>
        <span>強い鍵の中身は見せずに、何が必要かだけを整理します。</span>
      </div>

      <div className="darakeHumanOnePage__linkGrid" aria-label="設定ショートカット">
        <a href={DARAKE_SETUP_LINKS.githubNewSecret} target="_blank" rel="noreferrer">GitHubの登録ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.githubFineGrainedTokens} target="_blank" rel="noreferrer">GitHubの鍵ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.cloudflareSetupWorkflow} target="_blank" rel="noreferrer">自動設定を実行する</a>
        <a href={DARAKE_SETUP_LINKS.cloudflareApiTokens} target="_blank" rel="noreferrer">Cloudflareの鍵ページを開く</a>
      </div>

      <div className="darakeHumanOnePage__beginnerGuide">
        <div>
          <span>コード側に入ったもの</span>
          <strong>Issue作成ONは wrangler.toml で管理します。</strong>
        </div>
        <div>
          <span>GitHub側に登録するもの</span>
          <strong>CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / WORKER_GITHUB_TOKEN</strong>
        </div>
        <div>
          <span>自動で起きること</span>
          <strong>ActionsがCloudflareへ設定とWorker用のGitHub鍵を反映します。</strong>
        </div>
      </div>

      <div className="darakeHumanOnePage__settingGuide">
        <div>
          <span>入れる場所</span>
          <strong>GitHub → Settings → Secrets and variables → Actions</strong>
        </div>
        <div>
          <span>実行する場所</span>
          <strong>GitHub → Actions → Cloudflare Setup → Run workflow</strong>
        </div>
      </div>

      <details className="darakeHumanOnePage__beginnerDetails">
        <summary>だらける順番を見る</summary>
        <p>
          1. Cloudflare用の鍵を作ります。
          2. GitHub用の鍵を作ります。
          3. GitHubの登録ページに3つの名前で保存します。
          4. Cloudflare Setup を実行します。
        </p>
        <p>鍵の中身はチャットにもアプリにも貼りません。</p>
      </details>
    </div>
  );
}
