import type { DraftJob } from './JobModal';

export default function UnscheduledLane({
  jobs,
  setJobs
}: {
  jobs: DraftJob[];
  setJobs(j: DraftJob[]): void;
}) {
  /* remove a card manually, e.g. with an [x] button if you like */
  const remove = (id: string) => setJobs(jobs.filter(j => j.id !== id));

  return (
    <div style={{ margin: '20px 0' }}>
      <h4>Unscheduled Jobs</h4>

      <div style={{ display: 'flex', gap: 8, minHeight: 60 }}>
        {jobs.map(j => (
          <div
            key={j.id}
            className="pool-card"
            data-id={j.id}
            data-hours={j.hours_required}
            style={{
              padding: 8,
              borderRadius: 6,
              background: j.color_code,
              color: '#fff',
              cursor: 'grab'
            }}
          >
            {j.customer_name} ({j.hours_required}h)
            {/* optional remove button
            <span onClick={() => remove(j.id)} style={{ marginLeft: 6, cursor: 'pointer' }}>✕</span>
            */}
          </div>
        ))}
      </div>
    </div>
  );
}
