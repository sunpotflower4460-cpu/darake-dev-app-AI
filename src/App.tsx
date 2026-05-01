import type { ReactNode } from 'react';
import { Bell, Camera, CheckCircle2, CircleDotDashed, ClipboardCheck, GitPullRequest, ListChecks, PauseCircle, Rocket, ShieldCheck, Sparkles, Store, Wand2, Workflow } from 'lucide-react';
import { agentChecks, generatedPlan, notificationPlan, screenshotChecks } from './data/mockFlow';
import { blueprint, initialSeed, phases, reviewChecks, submissionDraft } from './data/mockProject';
import type { AgentCheck, PhasePlan, ReviewCheck, RiskLevel, ScreenshotCheck } from './types';

const riskLabel: Record<RiskLevel, string> = {
  low: '低リスク',
  medium: '要確認',
  high: '必ず停止',
};

const statusLabel: Record<PhasePlan['status'], string> = {
  not_started: '未開始',
  running: '進行中',
  waiting_review: '確認待ち',
  passed: '完了',
  blocked: '停止中',
};

const reviewLabel: Record<ReviewCheck['state'], string> = {
  ok: 'OK',
  watch: '注意',
  blocked: '停止',
  pending: '確認待ち',
};

const agentStatusLabel: Record<AgentCheck['status'], string> = {
  ready: '待機',
  checking: '確認中',
  passed: '通過',
  needs_human: '手動確認',
};

const screenshotStatusLabel: Record<ScreenshotCheck['status'], string> = {
  planned: '予定',
  captured: '取得済み',
  needs_review: '確認待ち',
};

function SectionHeader({ icon, title, lead }: { icon: ReactNode; title: string; lead: string }) {
  return (
    <div className="sectionHeader">
      <div className="sectionIcon">{icon}</div>
      <div>
        <p className="eyebrow">Darake Dev Gate</p>
        <h2>{title}</h2>
        <p>{lead}</p>
      </div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: PhasePlan }) {
  return (
    <article className={`phaseCard risk-${phase.risk}`}>
      <div className="phaseTop">
        <span>{phase.id}</span>
        <strong>{statusLabel[phase.status]}</strong>
      </div>
      <h3>{phase.title}</h3>
      <p>{phase.summary}</p>
      <dl>
        <div>
          <dt>自動化</dt>
          <dd>{phase.autoRunnable ? '自動進行可' : '手動確認'}</dd>
        </div>
        <div>
          <dt>危険度</dt>
          <dd>{riskLabel[phase.risk]}</dd>
        </div>
      </dl>
      <div className="gateBox">
        <span>停止ゲート</span>
        <p>{phase.stopGate}</p>
      </div>
      <div className="doneBox">
        <span>完了条件</span>
        <p>{phase.doneDefinition}</p>
      </div>
    </article>
  );
}

function ReviewItem({ check }: { check: ReviewCheck }) {
  return (
    <li className={`reviewItem state-${check.state}`}>
      <div>
        <strong>{check.label}</strong>
        <p>{check.detail}</p>
      </div>
      <span>{reviewLabel[check.state]}</span>
    </li>
  );
}

function AgentCard({ agent }: { agent: AgentCheck }) {
  return (
    <article className={`agentCard agent-${agent.status}`}>
      <div className="agentTop">
        <strong>{agent.name}</strong>
        <span>{agentStatusLabel[agent.status]}</span>
      </div>
      <p className="agentRole">{agent.role}</p>
      <p>{agent.message}</p>
    </article>
  );
}

function ScreenshotCard({ item }: { item: ScreenshotCheck }) {
  return (
    <article className="screenshotCard">
      <div className="screenshotFrame">
        <Camera size={22} />
        <span>{item.viewport === 'mobile' ? 'Mobile' : 'Desktop'}</span>
      </div>
      <div>
        <div className="agentTop">
          <strong>{item.label}</strong>
          <span>{screenshotStatusLabel[item.status]}</span>
        </div>
        <p>{item.note}</p>
      </div>
    </article>
  );
}

export default function App() {
  return (
    <main className="appShell">
      <section className="hero">
        <div className="heroBadge">
          <Sparkles size={16} />
          <span>魂・種から完成通知まで</span>
        </div>
        <h1>Darake Dev App AI</h1>
        <p className="heroLead">
          「こんなアプリが作りたい」を置くだけで、設計、段階分解、確認ゲート、改善、提出準備までをやさしく管制するためのアプリです。
        </p>
        <div className="heroActions">
          <a href="#seed" className="primaryButton">種を置く</a>
          <a href="#phases" className="ghostButton">段階を見る</a>
        </div>
      </section>

      <section id="seed" className="panel seedPanel">
        <SectionHeader icon={<Wand2 />} title="1. 魂・種を置く" lead="最初は完璧な仕様書ではなく、作りたい気持ちを置くだけで始まります。" />
        <div className="seedGrid">
          <label>
            アプリ名の仮タイトル
            <input defaultValue={initialSeed.title} />
          </label>
          <label>
            どんな人に届けたいか
            <input defaultValue={initialSeed.targetUser} />
          </label>
          <label className="wide">
            魂・種
            <textarea defaultValue={initialSeed.soul} rows={5} />
          </label>
          <label className="wide">
            どんな完成を望むか
            <textarea defaultValue={initialSeed.desiredOutcome} rows={3} />
          </label>
          <label className="wide">
            どこで止めたいか
            <textarea defaultValue={initialSeed.stopTiming} rows={3} />
          </label>
        </div>
        <div className="automationStrip">
          <span>自動化レベル</span>
          <strong>ほぼ自動・危険時だけ停止</strong>
        </div>
      </section>

      <section className="panel planPanel">
        <SectionHeader icon={<Workflow />} title="2. 種から計画を作る" lead="入力された願いを、一旦の完成まで進むためのやさしい計画へ変換します。" />
        <div className="generatedPlan">
          <div>
            <p className="eyebrow">Generated Plan</p>
            <h3>{generatedPlan.title}</h3>
            <p>{generatedPlan.summary}</p>
          </div>
          <div className="planColumns">
            <div>
              <h4>次に進めること</h4>
              <ol>{generatedPlan.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
            </div>
            <div>
              <h4>必ず止まるところ</h4>
              <ol>{generatedPlan.humanStops.map((item) => <li key={item}>{item}</li>)}</ol>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHeader icon={<ClipboardCheck />} title="3. 設計図に変換" lead="種を、目的・MVP・やらないこと・完成条件へ翻訳します。" />
        <div className="blueprintGrid">
          <div className="blueprintMain">
            <h3>目的</h3>
            <p>{blueprint.purpose}</p>
          </div>
          <div>
            <h3>MVP</h3>
            <ul>{blueprint.mvp.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>初期版でやらないこと</h3>
            <ul>{blueprint.notDoing.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>一旦の完成条件</h3>
            <ul>{blueprint.completionSignals.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="phases" className="panel">
        <SectionHeader icon={<GitPullRequest />} title="4. Phaseに分けて進める" lead="AIが一気に暴走しないよう、確認できる小さな段階へ分けます。" />
        <div className="timelineRail" aria-label="Phase progress">
          {phases.map((phase) => <span key={phase.id} className={`timelineDot ${phase.status}`} title={phase.title} />)}
        </div>
        <div className="phaseGrid">
          {phases.map((phase) => <PhaseCard phase={phase} key={phase.id} />)}
        </div>
      </section>

      <section className="panel reviewPanel">
        <SectionHeader icon={<ShieldCheck />} title="5. 確認エージェントの門" lead="コード、画面、ビルド、危険変更を確認してから次へ進みます。" />
        <div className="agentGrid">
          {agentChecks.map((agent) => <AgentCard agent={agent} key={agent.name} />)}
        </div>
        <ul className="reviewList">
          {reviewChecks.map((check) => <ReviewItem check={check} key={check.label} />)}
        </ul>
      </section>

      <section className="panel screenshotPanel">
        <SectionHeader icon={<Camera />} title="6. 自動スクショ確認の予定" lead="今はモック表示です。後で画面崩れをスクリーンショットで確認する管制欄に育てます。" />
        <div className="screenshotGrid">
          {screenshotChecks.map((item) => <ScreenshotCard item={item} key={`${item.label}-${item.viewport}`} />)}
        </div>
        <div className="screenshotMock">
          <CircleDotDashed />
          <div>
            <strong>今の状態</strong>
            <p>Phase 2では予定表示まで。次の段階で実際の取得・比較・添削の流れを足します。</p>
          </div>
        </div>
      </section>

      <section className="panel notifyPanel">
        <SectionHeader icon={<PauseCircle />} title="7. 止めるタイミングと通知" lead="普段は進み、大事な場面だけ呼ぶ。開発が重くなりすぎないための交通整理です。" />
        <div className="notifyCard">
          <div>
            <p className="eyebrow">通知モード</p>
            <h3>{notificationPlan.mode === 'pause_on_risk' ? '危険時だけ止める' : '段階ごとに確認'}</h3>
            <p>{notificationPlan.message}</p>
          </div>
          <div className="channelList">
            {notificationPlan.channels.map((channel) => <span key={channel}>{channel}</span>)}
          </div>
        </div>
      </section>

      <section className="panel submitPanel">
        <SectionHeader icon={<Store />} title="8. 提出準備をまとめる" lead="App Store提出などの手動項目を、最後に慌てないよう同じ場所へ集めます。" />
        <div className="submissionGrid">
          <label>アプリ名<input defaultValue={submissionDraft.appName} /></label>
          <label>サブタイトル<input defaultValue={submissionDraft.subtitle} /></label>
          <label className="wide">説明文<textarea rows={4} defaultValue={submissionDraft.description} /></label>
          <label className="wide">プライバシー説明<textarea rows={3} defaultValue={submissionDraft.privacyNote} /></label>
          <label className="wide">審査メモ<textarea rows={3} defaultValue={submissionDraft.reviewNote} /></label>
        </div>
      </section>

      <section className="finishCard">
        <div>
          <Rocket />
          <h2>完成通知の理想</h2>
          <p>「Phase完了」「確認OK」「次へ進みます」「完成しました」を、やさしい言葉で返す管制室に育てます。</p>
        </div>
        <div>
          <Bell />
          <h2>止まる場所</h2>
          <p>大事な判断、提出、本番公開、大きな方向転換では必ず止まります。普段は静かに進み、必要な時だけ呼びます。</p>
        </div>
        <div>
          <CheckCircle2 />
          <h2>次の実装</h2>
          <p>次フェーズでは、このUIを実際のIssue / PR / CI確認へ接続する受け皿を追加します。</p>
        </div>
      </section>
    </main>
  );
}
