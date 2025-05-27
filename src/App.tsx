import { useState } from 'react';
import { socket } from './socket';

import Form from './components/CreateJobForm';
import StaffManager from './components/StaffManager';
import ScheduleCalendar from './components/ScheduleCalendar';

/* ────────────────────────────────────────── */

export default function App() {
  // no auth needed
  const [showForm, setShowForm] = useState(false);

  // still connect socket immediately
  socket();

  return (
    <div style={{ padding: 20 }}>
      <h2>LEGG Scheduler (public demo)</h2>

      <button onClick={() => setShowForm(x => !x)} style={{ marginBottom: 10 }}>
        {showForm ? 'Hide Job Form' : 'Create New Job'}
      </button>
      {showForm && <Form onDone={() => setShowForm(false)} />}

      <StaffManager />
      <ScheduleCalendar />
    </div>
  );
}
