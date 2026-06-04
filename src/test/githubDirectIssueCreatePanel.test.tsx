import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GitHubDirectIssueCreatePanel } from '../components/GitHubDirectIssueCreatePanel';

vi.mock('../utils/githubIssueCreateClient', () => ({
  createGitHubIssue: vi.fn(),
}));

vi.mock('../utils/githubIssueCreateState', () => ({
  loadGitHubIssueCreateState: () => ({ repoUrl: '', updatedAt: new Date().toISOString() }),
  saveGitHubIssueCreateState: vi.fn(),
}));

vi.mock('../utils/githubIssueRecord', () => ({
  saveGitHubIssueRecord: vi.fn(),
  loadGitHubIssueRecord: () => null,
}));

vi.mock('../utils/ponStartPack', () => ({
  buildPonStartPack: () => ({
    status: 'ready',
    appName: 'Sample App',
    issueDraftMarkdown: '# Sample issue title\n\nissue body',
    cloudAgentInstructionMarkdown: 'instruction',
  }),
}));

vi.mock('../utils/darakeRuntimeEvents', () => ({
  subscribeDarakeRuntimeEvents: () => () => {},
}));

describe('GitHubDirectIssueCreatePanel write gate', () => {
  it('requires explicit confirmation before enabling create button', () => {
    render(<GitHubDirectIssueCreatePanel />);

    const repoUrlInput = screen.getByLabelText('GitHubリポジトリURL') as HTMLInputElement;
    fireEvent.change(repoUrlInput, { target: { value: 'https://github.com/example/repo' } });

    const createButton = screen.getByRole('button', { name: 'Issueを作成する' }) as HTMLButtonElement;
    expect(createButton.disabled).toBe(true);

    const confirmCheckbox = screen.getByLabelText('プレビュー内容を確認し、Issue作成を実行します') as HTMLInputElement;
    fireEvent.click(confirmCheckbox);

    expect(createButton.disabled).toBe(false);
  });
});
