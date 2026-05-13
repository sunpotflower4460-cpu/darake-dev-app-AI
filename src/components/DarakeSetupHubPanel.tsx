import { DARAKE_SETUP_LINKS } from '../utils/darakeSetupLinks';

const REQUIRED_SETUP_NAMES = [
  'CLOUDFLARE_API_TOKEN',
  'WORKER_GITHUB_TOKEN',
] as const;

const OPTIONAL_SETUP_NAMES = [
  'CLOUDFLARE_ACCOUNT_ID',
] as const;

function copyText(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return;
  void navigator.clipboard.writeText(value);
}

export function DarakeSetupHubPanel() {
  return (
    <div className="darakeHumanOnePage__repoFix" aria-label="だらけセットアップHub">
      <div className="darakeHumanOnePage__repoFixHeader">
        <strong>初期設定ここだけ</strong>
        <span>読むより、上から押してコピーして進めるための場所です。</span>
      </div>

      <div className="darakeHumanOnePage__linkGrid" aria-label="最短セットアップリンク">
        <a href={DARAKE_SETUP_LINKS.cloudflareApiTokens} target="_blank" rel="noreferrer">1. Cloudflareの鍵を作る</a>
        <a href={DARAKE_SETUP_LINKS.githubFineGrainedTokens} target="_blank" rel="noreferrer">2. GitHubの鍵を作る</a>
        <a href={DARAKE_SETUP_LINKS.githubNewSecret} target="_blank" rel="noreferrer">3. GitHubに登録する</a>
        <a href={DARAKE_SETUP_LINKS.cloudflareSetupWorkflow} target="_blank" rel="noreferrer">4. 自動設定を実行する</a>
      </div>

      <div className="darakeHumanOnePage__copyList" aria-label="登録名コピー">
        <span className="darakeHumanOnePage__label">GitHubに登録する名前</span>
        {REQUIRED_SETUP_NAMES.map((name) => (
          <button key={name} type="button" onClick={() => copyText(name)}>
            <strong>{name}</strong>
            <span>コピー</span>
          </button>
        ))}
      </div>

      <details className="darakeHumanOnePage__beginnerDetails">
        <summary>複数Cloudflareアカウントで止まった時だけ開く</summary>
        <div className="darakeHumanOnePage__copyList darakeHumanOnePage__copyList--inside">
          {OPTIONAL_SETUP_NAMES.map((name) => (
            <button key={name} type="button" onClick={() => copyText(name)}>
              <strong>{name}</strong>
              <span>コピー</span>
            </button>
          ))}
        </div>
        <p>Cloudflareアカウントが1つだけなら、基本ここは使わなくて大丈夫です。</p>
      </details>

      <div className="darakeHumanOnePage__settingGuide">
        <div>
          <span>最後にやること</span>
          <strong>Cloudflare Setupが成功したら、だらけdev appに戻って「設定したので再チェック」を押します。</strong>
        </div>
      </div>
    </div>
  );
}
