import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DarakeCurrentWorkPanel } from '../components/DarakeCurrentWorkPanel';
import { DarakeHumanOnePageCockpit } from '../components/DarakeHumanOnePageCockpit';
import { DeepBuildModePanel } from '../components/DeepBuildModePanel';

vi.mock('../utils/omakaseStartState', () => ({
  loadOmakaseStartState: () => null,
}));

vi.mock('../utils/runOmakaseStart', () => ({
  runOmakaseStart: vi.fn(async () => undefined),
}));

describe('major panels smoke', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders DarakeHumanOnePageCockpit without crashing on empty storage', () => {
    render(<DarakeHumanOnePageCockpit />);
    expect(screen.getByRole('main', { name: 'だらけdev app 人間用1ページ' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'サンプルで一気に試す' })).toBeTruthy();
  });

  it('renders DeepBuildModePanel without existing plan', () => {
    render(<DeepBuildModePanel />);
    expect(screen.getByRole('button', { name: '熟成計画を作る' })).toBeTruthy();
  });

  it('renders DarakeCurrentWorkPanel with active session', () => {
    render(
      <DarakeCurrentWorkPanel
        session={{
          id: 'work-1',
          appName: 'Demo App',
          oneLineIdea: 'idea',
          repoUrl: 'https://github.com/example/repo',
          issueUrl: null,
          issueNumber: 12,
          prUrl: null,
          prNumber: null,
          previewUrl: null,
          currentPhaseTitle: 'UI phase',
          currentInstruction: null,
          status: 'agent-working',
          nextActionLabel: 'Issueを確認する',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByText('今の作業')).toBeTruthy();
    expect(screen.getByRole('button', { name: '次へ' })).toBeTruthy();
  });
});
