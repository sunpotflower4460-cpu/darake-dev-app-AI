import { useEffect, useState } from 'react';
import { ExternalLink, FolderGit2, Plus, RefreshCw } from 'lucide-react';
import {
  createProject,
  listProjects as fetchProjects,
} from '../services/projectListService';
import { projectStatusLabel, type DarakeProject } from '../utils/darakeProject';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; projects: DarakeProject[] }
  | { kind: 'error'; message: string };

export function MultiProjectDashboardPanel() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ text: string; error: boolean } | null>(null);

  async function load() {
    setState({ kind: 'loading' });
    const res = await fetchProjects(50);
    if (res.ok) {
      setState({ kind: 'loaded', projects: res.projects });
    } else {
      setState({ kind: 'error', message: `[${res.code}] ${res.error}` });
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    if (!newName.trim()) {
      setCreateMsg({ text: 'プロジェクト名を入力してください', error: true });
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    const res = await createProject({ projectName: newName.trim() });
    setCreating(false);
    if (res.ok) {
      setCreateMsg({ text: `作成しました: ${res.project.repoFullName}`, error: false });
      setNewName('');
      void load();
    } else {
      setCreateMsg({ text: `[${res.code}] ${res.error}`, error: true });
    }
  }

  return (
    <div className="multiProjectDashboard">
      <div className="multiProjectHero">
        <FolderGit2 />
        <div>
          <p className="eyebrow">Phase 103 / Portfolio</p>
          <h3>並列プロジェクト ダッシュボード</h3>
          <p>複数アプリを並列で動かし、それぞれの状態をまとめて確認します。</p>
        </div>
      </div>

      <div className="appDesignInputSafety">
        <strong>設定が必要:</strong> Worker Secretに <code>GITHUB_TOKEN</code>、wrangler変数{' '}
        <code>DARAKE_PROJECT_BOOTSTRAP_ENABLED=true</code> と{' '}
        <code>STARTER_TEMPLATE_REPO</code>、KV <code>RUN_REGISTRY_KV</code> のバインドが必要です。
      </div>

      <div className="multiProjectCreate">
        <label>
          新規プロジェクト名
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例: ねこ電卓"
            maxLength={80}
          />
        </label>
        <button type="button" className="primary" onClick={handleCreate} disabled={creating}>
          <Plus size={14} /> {creating ? '作成中…' : 'スターターから作成'}
        </button>
        {createMsg && (
          <span className={`multiProjectMsg ${createMsg.error ? 'error' : ''}`}>
            {createMsg.text}
          </span>
        )}
      </div>

      <div className="multiProjectBar">
        <strong style={{ fontSize: '0.9rem', color: '#35513d' }}>進行中プロジェクト</strong>
        <button type="button" onClick={() => void load()}>
          <RefreshCw size={13} /> 更新
        </button>
      </div>

      {state.kind === 'loading' && <p className="multiProjectMsg">読み込み中…</p>}
      {state.kind === 'error' && <p className="multiProjectMsg error">{state.message}</p>}
      {state.kind === 'loaded' && state.projects.length === 0 && (
        <p className="multiProjectMsg">まだプロジェクトがありません。</p>
      )}
      {state.kind === 'loaded' && state.projects.length > 0 && (
        <div className="multiProjectGrid">
          {state.projects.map((p) => (
            <div key={p.id} className="multiProjectCard">
              <span className={`multiProjectStatusPill ${p.status}`}>
                {projectStatusLabel(p.status)}
              </span>
              <h4>{p.name}</h4>
              <div className="meta">{p.repoFullName}</div>
              {p.currentPhaseId && <div className="meta">現在: {p.currentPhaseId}</div>}
              {p.plan?.phases && (
                <div className="meta">フェーズ数: {p.plan.phases.length}</div>
              )}
              <div className="meta">更新: {new Date(p.updatedAt).toLocaleString('ja-JP')}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={p.repoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={11} style={{ verticalAlign: 'middle' }} /> リポジトリ
                </a>
                {p.pagesPreviewBaseUrl && (
                  <a href={p.pagesPreviewBaseUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={11} style={{ verticalAlign: 'middle' }} /> プレビュー
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
