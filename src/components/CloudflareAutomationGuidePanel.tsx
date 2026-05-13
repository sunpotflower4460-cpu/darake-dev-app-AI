import { DARAKE_SETUP_LINKS } from '../utils/darakeSetupLinks';

export function CloudflareAutomationGuidePanel() {
  return (
    <div className="darakeHumanOnePage__repoFix" aria-label="Cloudflare自動化ガイド">
      <div className="darakeHumanOnePage__repoFixHeader">
        <strong>Cloudflare設定を自動化する</strong>
        <span>最初に1回だけGitHub側へ登録すると、次からCloudflare反映を自動化できます。</span>
      </div>

      <div className="darakeHumanOnePage__linkGrid" aria-label="設定ショートカット">
        <a href={DARAKE_SETUP_LINKS.cloudflareApiTokens} target="_blank" rel="noreferrer">Cloudflareの鍵ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.githubFineGrainedTokens} target="_blank" rel="noreferrer">GitHubの鍵ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.githubNewSecret} target="_blank" rel="noreferrer">GitHubの登録ページを開く</a>
        <a href={DARAKE_SETUP_LINKS.cloudflareSetupWorkflow} target="_blank" rel="noreferrer">自動設定を実行する</a>
      </div>

      <div className="darakeHumanOnePage__beginnerGuide">
        <div><span>これは何？</span><strong>Cloudflare画面で何度も設定場所を探さなくていいようにする仕組みです。</strong></div>
        <div><span>人間がやること</span><strong>最初に1回だけ、必要な登録をGitHub側で行います。</strong></div>
        <div><span>Actionsがやること</span><strong>Cloudflareへデプロイし、Worker側のGitHub連携も反映します。</strong></div>
      </div>

      <div className="darakeHumanOnePage__settingGuide">
        <div><span>GitHub側に入れる名前</span><strong>CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / WORKER_GITHUB_TOKEN</strong></div>
        <div><span>実行する場所</span><strong>GitHub → Actions → Cloudflare Setup → Run workflow</strong></div>
      </div>

      <details className="darakeHumanOnePage__beginnerDetails">
        <summary>初心者向けの流れを見る</summary>
        <p>Cloudflare用とGitHub用の登録をGitHub側にまとめ、最後に自動設定を実行します。</p>
        <p>強い値はチャットやコードには貼りません。GitHub側の安全な登録場所にだけ入れます。</p>
      </details>
    </div>
  );
}
