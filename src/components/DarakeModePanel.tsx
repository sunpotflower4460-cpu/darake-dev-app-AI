import { Coffee, Leaf, Moon } from 'lucide-react';
import { darakePrinciples, darakeTasks, type DarakeLane } from '../data/darakeMode';

const laneMeta: Record<DarakeLane, { title: string; icon: JSX.Element; lead: string }> = {
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

export function DarakeModePanel() {
  return (
    <div className="darakePanel">
      <div className="darakeHero">
        <p className="eyebrow">Darake Mode</p>
        <h3>だらけるための仕分け</h3>
        <p>確認作業を全部抱えず、意味のあるところにだけ力を残します。</p>
        <div className="darakePrinciples">
          {darakePrinciples.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>

      <div className="darakeLaneGrid">
        {lanes.map((lane) => {
          const meta = laneMeta[lane];
          const tasks = darakeTasks.filter((task) => task.lane === lane);

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
                {tasks.map((task) => (
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
