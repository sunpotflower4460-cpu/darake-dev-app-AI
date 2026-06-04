import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BeginnerNextStepCardPanel } from '../components/BeginnerNextStepCardPanel';
import { FirstStartAdvancedOpenPanel } from '../components/FirstStartAdvancedOpenPanel';
import { StatusPanel } from '../components/StatusPanel';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('component smoke render', () => {
  it('renders FirstStartAdvancedOpenPanel', () => {
    render(<FirstStartAdvancedOpenPanel />);
    expect(screen.getByRole('button', { name: '詳細な管制室を開く' })).toBeTruthy();
  });

  it('renders BeginnerNextStepCardPanel', () => {
    render(<BeginnerNextStepCardPanel />);
    expect(screen.getByText(/心配しなくていいこと/)).toBeTruthy();
  });

  it('renders StatusPanel', () => {
    render(<StatusPanel />);
    expect(screen.getByText('今の表示モード')).toBeTruthy();
  });
});
