import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { socket } from './socket';
import Weekly from './components/WeeklyCalendarView';
import Form from './components/CreateJobForm';

export default function App() {
  const [session, setSession] = useState<any>();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  useEffect(() => {
    if (session) socket();
  }, [session]);

  if (!session)
    return (
      <button onClick={() => supabase.auth.signInWithOtp({ email: prompt('Email?')! })}>
        Login via OTP
      </button>
    );

  return (
    <>
      <p>
        Welcome {session.user.email}{' '}
        <button onClick={() => supabase.auth.signOut()}>Log out</button>
      </p>
      <button onClick={() => setShowForm(x => !x)}>
        {showForm ? 'Hide' : 'Create Job'}
      </button>
      {showForm && <Form onDone={() => setShowForm(false)} />}
      <Weekly />
    </>
  );
}
