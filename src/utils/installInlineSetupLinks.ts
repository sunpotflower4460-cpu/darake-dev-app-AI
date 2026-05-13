import { DARAKE_SETUP_LINKS } from './darakeSetupLinks';

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

function isCloudflareBlocker(card: HTMLElement): boolean {
  const text = card.textContent ?? '';
  return (
    text.includes('Cloudflare') &&
    (text.includes('Secret') ||
      text.includes('GITHUB_TOKEN') ||
      text.includes('GITHUB_ISSUE_CREATE_ENABLED') ||
      text.includes('WORKER_GITHUB_TOKEN'))
  );
}

function injectInlineSetupLinks() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.darakeHumanOnePage__repoFix'));

  for (const card of cards) {
    if (!isCloudflareBlocker(card)) continue;
    if (card.querySelector('[data-darake-inline-setup-links="true"]')) continue;

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
    if (header) {
      header.insertAdjacentElement('afterend', linkGrid);
      linkGrid.insertAdjacentElement('afterend', copyList);
      copyList.insertAdjacentElement('afterend', note);
    } else {
      card.prepend(note);
      card.prepend(copyList);
      card.prepend(linkGrid);
    }
  }
}

let installed = false;

export function installInlineSetupLinks() {
  if (installed) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  installed = true;

  window.setTimeout(injectInlineSetupLinks, 0);
  const observer = new MutationObserver(injectInlineSetupLinks);
  observer.observe(document.body, { childList: true, subtree: true });
}

installInlineSetupLinks();
