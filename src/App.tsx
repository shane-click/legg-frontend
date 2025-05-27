import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { socket } from './socket';

import Form from './components/CreateJobForm';
import StaffManager from './components/StaffManager';
import ScheduleCalendar from './components/ScheduleCalendar';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  /* ────────────────────── auth bootstrap ────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  /* ────────────────────── socket connect ────────────────────── */
  useEffect(() => {
    if (session) socket();
  }, [session]);

  /* ────────────────────── login screen ────────────────────── */
  if (!session)
    return (
      <button
        onClick={() =>
          supabase.auth.signInWithOtp({ email: prompt('Email address?')! })
        }
      >
        Login via OTP
      </button>
    );

  /* ────────────────────── main app ────────────────────── */
  return (
    <div style={{ padding: 20 }}>
      <p>
        Welcome {session.user.email}{' '}
        <button onClick={() => supabase.auth.signOut()}>Log out</button>
      </p>

      <button onClick={() => setShowForm(x => !x)} style={{ marginBottom: 10 }}>
        {showForm ? 'Hide Job Form' : 'Create New Job'}
      </button>
      {showForm && <Form onDone={() => setShowForm(false)} />}

      {/* staff roster card */}
      <StaffManager />

      {/* google-style calendar */}
      <ScheduleCalendar />
    </div>
  );
}
