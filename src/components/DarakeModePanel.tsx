import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Coffee, Leaf, Moon } from 'lucide-react';
import { darakePrinciples, darakeTasks, type DarakeLane, type DarakeTask } from '../data/darakeMode';
import { loadRepoState, type LoadedRepoState } from '../services/repoStateService';

const laneMeta: Record<DarakeLane, { title: string; icon: ReactNode; lead: string }> = {
  now: {
    title: '今やる',
    icon: <Coffee />,
    lead: 'ここだけ見れば大丈夫。',
  },
  later: {
    title: '後でいい',
    icon: <Leaf />,
    lead: '寝かせても価値は減りません。',
  },
  leave: {
    title: '放っておいていい',
    icon: <Moon />,
    lead: 'やらない勇気も開発力です。',
  },
};

const lanes: DarakeLane[] = ['now', 'later', 'leave'];

function applyFreshness(tasks: DarakeTask[], state: LoadedRepoState | null): DarakeTask[] {
  if (!state) {
    return tasks;
  }

  return tasks.map((task) => {
    if (task.id !== 'check-freshness') {
      return task;
    }

    if (state.freshness.canRelax) {
      return {
        ...task,
        lane: 'leave',
        title: '状態は新しめなので見なくていい',
        reason: state.freshness.message,
        energy: 'low',
      };
    }

    return {
      ...task,
      lane: 'now',
      title: '状態が古いので軽く確認する',
      reason: state.freshness.message,
      energy: 'low',
    };
  });
}

export function DarakeModePanel() {
  const [state, setState] = useState<LoadedRepoState | null>(null);

  useEffect(() => {
    let active = true;

    loadRepoState().then((nextState) => {
      if (active) {
        setState(nextState);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const tasks = useMemo(() => applyFreshness(darakeTasks, state), [state]);

  return (
    <div className="darakePanel">
      <div className="darakeHero">
        <p className="eyebrow">Darake Mode</p>
        <h3>だらけるための仕分け</h3>
        <p>確認作業を全部抱えず、意味のあるところにだけ力を残します。</p>
        {state && (
          <div className={`darakeStateBanner darakeState-${state.freshness.level}`}>
            <strong>{state.freshness.canRelax ? '今はだらけ寄りでOK' : '軽く確認だけしよう'}</strong>
            <span>{state.freshness.label}</span>
            <p>{state.freshness.message}</p>
          </div>
        )}
        <div className="darakePrinciples">
          {darakePrinciples.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>

      <div className="darakeLaneGrid">
        {lanes.map((lane) => {
          const meta = laneMeta[lane];
          const laneTasks = tasks.filter((task) => task.lane === lane);

          return (
            <section className={`darakeLane lane-${lane}`} key={lane}>
              <div className="darakeLaneHeader">
                {meta.icon}
                <div>
                  <h4>{meta.title}</h4>
                  <p>{meta.lead}</p>
                </div>
              </div>
              <div className="darakeTaskList">
                {laneTasks.map((task) => (
                  <article className="darakeTask" key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.reason}</p>
                    </div>
                    <span>{task.energy}</span>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
