import { useRef, useState, useEffect } from 'react';
import JobModal, { DraftJob } from './components/JobModal';
import UnscheduledLane from './components/UnscheduledLane';
import FullScheduler, { makePoolDraggable } from './components/FullScheduler';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [unscheduled, setUnscheduled] = useState<DraftJob[]>([]);
  const poolRef = useRef<HTMLDivElement>(null);

  /* make pool draggable when cards change */
  useEffect(() => {
    if (poolRef.current) makePoolDraggable(poolRef.current);
  }, [unscheduled]);

  return (
    <div style={{ padding: 20 }}>
      <h2>LEGG Scheduler</h2>

      <button onClick={() => setModalOpen(true)}>+ New Job</button>

      <JobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={j => setUnscheduled([...unscheduled, j])}
      />

      <div ref={poolRef}>
        <UnscheduledLane jobs={unscheduled} setJobs={setUnscheduled} />
      </div>

      <FullScheduler
        pool={poolRef.current!}
        unscheduled={unscheduled}
        setUnscheduled={setUnscheduled}
      />
    </div>
  );
}
