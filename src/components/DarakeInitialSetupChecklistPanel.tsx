export function DarakeInitialSetupChecklistPanel() {
  return (
    <div className="darakeHumanOnePage__repoFix" aria-label="だらけ初期設定チェックリスト">
      <div className="darakeHumanOnePage__repoFixHeader">
        <strong>だらけ初期設定チェックリスト</strong>
        <span>強い鍵の中身は見せずに、何が必要かだけを整理します。</span>
      </div>

      <div className="darakeHumanOnePage__beginnerGuide">
        <div>
          <span>もうコード側に入ったもの</span>
          <strong>GITHUB_ISSUE_CREATE_ENABLED=true は wrangler.toml で管理します。</strong>
        </div>
        <div>
          <span>Cloudflare自動デプロイに必要</span>
          <strong>CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を GitHub Secrets に入れます。</strong>
        </div>
        <div>
          <span>Issue作成に必要</span>
          <strong>GITHUB_TOKEN を Cloudflare Worker Secret に入れます。</strong>
        </div>
      </div>

      <div className="darakeHumanOnePage__settingGuide">
        <div>
          <span>GitHub Secrets に入れるもの</span>
          <strong>CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID</strong>
        </div>
        <div>
          <span>Cloudflare Worker Secret に入れるもの</span>
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
          1. GitHub Secrets に CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を入れます。
          2. GitHub Actions の Cloudflare Setup を実行します。
          3. だらけdev app に戻って「設定したので再チェック」を押します。
        </p>
        <p>
          その後 GITHUB_TOKEN が必要と出たら、Cloudflare Worker Secret にだけ入れます。
          トークンの中身はチャットにもアプリにも貼りません。
        </p>
      </details>
    </div>
  );
}
