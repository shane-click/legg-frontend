import { useState } from 'react';
import JobModal, { DraftJob } from './components/JobModal';
import UnscheduledLane from './components/UnscheduledLane';
import ScheduleCalendar from './components/ScheduleCalendar';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [unscheduled, setUnscheduled] = useState<DraftJob[]>([]);
  const [picked, setPicked] = useState<DraftJob | null>(null);

  return (
    <div style={{ padding: 20 }}>
      <h2>LEGG Scheduler</h2>

      <button onClick={() => setModalOpen(true)}>+ New Job</button>

      <JobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={j => setUnscheduled([...unscheduled, j])}
      />

      <UnscheduledLane
        jobs={unscheduled}
        setJobs={setUnscheduled}
        onCardPicked={j => setPicked(j)}
      />

      <ScheduleCalendar
        unscheduled={unscheduled}
        setUnscheduled={setUnscheduled}
        picked={picked}
        setPicked={setPicked}
      />
    </div>
  );
}
