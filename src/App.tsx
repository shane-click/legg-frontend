import { useState } from 'react';
import JobModal, { DraftJob } from './components/JobModal';
import UnscheduledLane from './components/UnscheduledLane';
import ScheduleCalendar from './components/ScheduleCalendar';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [unscheduled, setUnscheduled] = useState<DraftJob[]>([]);

  return (
    <div style={{ padding: 20 }}>
      <h2>LEGG Scheduler</h2>

      {/* ── create-job button & modal ───────────────────── */}
      <button onClick={() => setModalOpen(true)}>+ New Job</button>

      <JobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={j => setUnscheduled([...unscheduled, j])}
      />

      {/* ── unscheduled lane ────────────────────────────── */}
      <UnscheduledLane jobs={unscheduled} setJobs={setUnscheduled} />

      {/* ── main calendar ───────────────────────────────── */}
      <ScheduleCalendar
        unscheduled={unscheduled}
        setUnscheduled={setUnscheduled}
      />
    </div>
  );
}
