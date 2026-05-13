import { DARAKE_SETUP_LINKS } from '../utils/darakeSetupLinks';

export function CloudflareAutomationGuidePanel() {
  return (
    <div className="darakeHumanOnePage__repoFix" aria-label="Cloudflare自動化ガイド">
      <div className="darakeHumanOnePage__repoFixHeader">
        <strong>Cloudflare設定を自動化する</strong>
        <span>最初に1回だけ安全な鍵をGitHub側に登録すると、次からCloudflare設定を自動で直せます。</span>
      </div>

      <div className="darakeHumanOnePage__linkGrid" aria-label="設定ショートカット">
        <a href={DARAKE_SETUP_LINKS.cloudflareApiTokens} target="_blank" rel="noreferrer">Cloudflareの鍵ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.githubNewSecret} target="_blank" rel="noreferrer">GitHubの登録ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.cloudflareSetupWorkflow} target="_blank" rel="noreferrer">自動設定を実行する</a>
      </div>

      <div className="darakeHumanOnePage__beginnerGuide">
        <div>
          <span>これは何？</span>
          <strong>Cloudflareの設定を、人間が毎回探さなくていいようにする仕組みです。</strong>
        </div>
        <div>
          <span>人間がやること</span>
          <strong>最初に1回だけ、Cloudflareを操作できる鍵をGitHub側に登録します。</strong>
        </div>
        <div>
          <span>AI/Actionsがやること</span>
          <strong>GITHUB_ISSUE_CREATE_ENABLED=true をCloudflareへ反映します。</strong>
        </div>
      </div>

      <div className="darakeHumanOnePage__settingGuide">
        <div>
          <span>GitHub側に入れる名前 1</span>
          <strong>CLOUDFLARE_API_TOKEN</strong>
        </div>
        <div>
          <span>GitHub側に入れる名前 2</span>
          <strong>CLOUDFLARE_ACCOUNT_ID</strong>
        </div>
        <div>
          <span>実行する場所</span>
          <strong>GitHub → Actions → Cloudflare Setup → Run workflow</strong>
        </div>
      </div>

      <details className="darakeHumanOnePage__beginnerDetails">
        <summary>初心者向けの流れを見る</summary>
        <p>
          1. 「Cloudflareの鍵ページを開く」を開きます。
          2. 作った値を「GitHubの登録ページを開く」から登録します。
          3. 「自動設定を実行する」を開いて Run workflow を押します。
          4. だらけdev app に戻って「設定したので再チェック」を押します。
        </p>
        <p>
          強い鍵はチャットやコードには貼りません。GitHub側の安全な登録場所にだけ入れます。
        </p>
      </details>
    </div>
  );
}
