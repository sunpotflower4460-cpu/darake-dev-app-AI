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

function createInlineLink(label: string, href: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.target = '_blank';
  anchor.rel = 'noreferrer';
  anchor.textContent = label;
  return anchor;
}

function createInlineCopyButton(name: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  const strong = document.createElement('strong');
  strong.textContent = name;
  const span = document.createElement('span');
  span.textContent = 'コピー';
  button.append(strong, span);
  button.addEventListener('click', () => copyText(name));
  return button;
}

function installInlineCloudflareSetupLinks() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const inject = () => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.darakeHumanOnePage__repoFix'));
    for (const card of cards) {
      const text = card.textContent ?? '';
      const isCloudflareBlocker = text.includes('Cloudflare') && (text.includes('Secret') || text.includes('GITHUB_TOKEN') || text.includes('GITHUB_ISSUE_CREATE_ENABLED'));
      const alreadyInjected = card.querySelector('[data-darake-inline-setup-links="true"]');
      if (!isCloudflareBlocker || alreadyInjected) continue;

      const linkGrid = document.createElement('div');
      linkGrid.className = 'darakeHumanOnePage__linkGrid';
      linkGrid.setAttribute('data-darake-inline-setup-links', 'true');
      linkGrid.setAttribute('aria-label', 'この確認で使うリンク');
      linkGrid.append(
        createInlineLink('GitHubの登録ページを開く', DARAKE_SETUP_LINKS.githubNewSecret),
        createInlineLink('GitHubの鍵ページを開く', DARAKE_SETUP_LINKS.githubFineGrainedTokens),
        createInlineLink('自動設定を実行する', DARAKE_SETUP_LINKS.cloudflareSetupWorkflow),
      );

      const copyList = document.createElement('div');
      copyList.className = 'darakeHumanOnePage__copyList';
      copyList.setAttribute('data-darake-inline-copy-list', 'true');
      const label = document.createElement('span');
      label.className = 'darakeHumanOnePage__label';
      label.textContent = 'GitHubに登録する名前';
      copyList.append(label, createInlineCopyButton('WORKER_GITHUB_TOKEN'));

      const note = document.createElement('div');
      note.className = 'darakeHumanOnePage__settingGuide';
      note.setAttribute('data-darake-inline-note', 'true');
      const noteInner = document.createElement('div');
      const noteLabel = document.createElement('span');
      noteLabel.textContent = '今のおすすめ';
      const noteText = document.createElement('strong');
      noteText.textContent = 'Cloudflareへ直接入れず、GitHub側に WORKER_GITHUB_TOKEN として登録してから自動設定を実行します。';
      noteInner.append(noteLabel, noteText);
      note.append(noteInner);

      const header = card.querySelector('.darakeHumanOnePage__repoFixHeader');
      header?.insertAdjacentElement('afterend', linkGrid);
      linkGrid.insertAdjacentElement('afterend', copyList);
      copyList.insertAdjacentElement('afterend', note);
    }
  };

  window.setTimeout(inject, 0);
  const observer = new MutationObserver(inject);
  observer.observe(document.body, { childList: true, subtree: true });
}

installInlineCloudflareSetupLinks();

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
