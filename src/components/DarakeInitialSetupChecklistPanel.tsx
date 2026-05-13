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
        <a href={DARAKE_SETUP_LINKS.cloudflareSetupWorkflow} target="_blank" rel="noreferrer">自動設定を実行する</a>
        <a href={DARAKE_SETUP_LINKS.cloudflareWorkersPages} target="_blank" rel="noreferrer">Cloudflareを開く</a>
        <a href={DARAKE_SETUP_LINKS.githubFineGrainedTokens} target="_blank" rel="noreferrer">GitHubの鍵ページを開く</a>
      </div>

      <div className="darakeHumanOnePage__beginnerGuide">
        <div>
          <span>もうコード側に入ったもの</span>
          <strong>GITHUB_ISSUE_CREATE_ENABLED=true は wrangler.toml で管理します。</strong>
        </div>
        <div>
          <span>Cloudflare自動デプロイに必要</span>
          <strong>CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を GitHub側に入れます。</strong>
        </div>
        <div>
          <span>Issue作成に必要</span>
          <strong>GITHUB_TOKEN を Cloudflare Worker側に入れます。</strong>
        </div>
      </div>

      <div className="darakeHumanOnePage__settingGuide">
        <div>
          <span>GitHub側に入れるもの</span>
          <strong>CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID</strong>
        </div>
        <div>
          <span>Cloudflare Worker側に入れるもの</span>
          <strong>GITHUB_TOKEN</strong>
        </div>
        <div>
          <span>次に押す場所</span>
          <strong>GitHub → Actions → Cloudflare Setup → Run workflow</strong>
        </div>
      </div>

      <details className="darakeHumanOnePage__beginnerDetails">
        <summary>だらける順番を見る</summary>
        <p>
          1. 「GitHubの登録ページを開く」から CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を入れます。
          2. 「自動設定を実行する」を開いて Run workflow を押します。
          3. だらけdev app に戻って「設定したので再チェック」を押します。
        </p>
        <p>
          その後 GITHUB_TOKEN が必要と出たら「Cloudflareを開く」から Worker Secret にだけ入れます。
          トークンの中身はチャットにもアプリにも貼りません。
        </p>
      </details>
    </div>
  );
}
