export function CloudflareAutomationGuidePanel() {
  return (
    <div className="darakeHumanOnePage__repoFix" aria-label="Cloudflare自動化ガイド">
      <div className="darakeHumanOnePage__repoFixHeader">
        <strong>Cloudflare設定を自動化する</strong>
        <span>最初に1回だけ安全な鍵をGitHub Secretsに入れると、次からCloudflare設定を自動で直せます。</span>
      </div>

      <div className="darakeHumanOnePage__beginnerGuide">
        <div>
          <span>これは何？</span>
          <strong>Cloudflareの設定を、人間が毎回探さなくていいようにする仕組みです。</strong>
        </div>
        <div>
          <span>人間がやること</span>
          <strong>最初に1回だけ、CloudflareのAPI TokenをGitHub Secretsに入れます。</strong>
        </div>
        <div>
          <span>AI/Actionsがやること</span>
          <strong>GITHUB_ISSUE_CREATE_ENABLED=true をCloudflareへ反映します。</strong>
        </div>
      </div>

      <div className="darakeHumanOnePage__settingGuide">
        <div>
          <span>GitHub Secretsに入れる名前 1</span>
          <strong>CLOUDFLARE_API_TOKEN</strong>
        </div>
        <div>
          <span>GitHub Secretsに入れる名前 2</span>
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
          1. CloudflareでAPI Tokenを作ります。
          2. GitHubのSecretsに CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を入れます。
          3. GitHub Actionsの Cloudflare Setup を実行します。
          4. だらけdev app に戻って「設定したので再チェック」を押します。
        </p>
        <p>
          API Tokenは強い鍵なので、チャットやコードには貼りません。GitHub Secretsにだけ入れます。
        </p>
      </details>
    </div>
  );
}
