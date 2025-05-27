import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const API = import.meta.env.VITE_API_BASE_URL;

interface Staff {
  id: number;
  name: string;
  default_daily_capacity: number;
}

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [name, setName]   = useState('');
  const [cap,  setCap]    = useState('7');
  const [error, setError] = useState<string | null>(null);

  /* ── helpers ─────────────────────────────────── */
  const load = async () => {
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const r = await fetch(`${API}/staff`, {
        headers: { Authorization: `Bearer ${session!.access_token}` }
      });
      if (!r.ok) throw new Error(await r.text());
      setStaff(await r.json());
    } catch (e: any) { setError(e.message); }
  };

  const add = async () => {
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const r = await fetch(`${API}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ name, default_daily_capacity: parseFloat(cap) })
      });
      if (!r.ok) throw new Error(await r.text());
      setName(''); setCap('7'); load();
    } catch (e: any) { setError(e.message); }
  };

  /* ── init ─────────────────────────────────────── */
  useEffect(() => { load(); }, []);

  /* ── UI ───────────────────────────────────────── */
  return (
    <div style={{border:'1px solid #ccc',borderRadius:8,padding:12,maxWidth:350,marginTop:20}}>
      <h3 style={{margin:'4px 0'}}>Staff</h3>
      {error && <p style={{color:'red',fontSize:12}}>{error}</p>}

      <ul style={{listStyle:'none',padding:0}}>
        {staff.map(s => (
          <li key={s.id} style={{display:'flex',justifyContent:'space-between'}}>
            <span>{s.name}</span>
            <span style={{fontSize:12,color:'#666'}}>{s.default_daily_capacity} h</span>
          </li>
        ))}
      </ul>

      <div style={{display:'flex',gap:6,marginTop:8}}>
        <input
          style={{flex:1}}
          placeholder="Name"
          value={name}
          onChange={e=>setName(e.target.value)}
        />
        <input
          type="number" step="0.25"
          style={{width:60}}
          value={cap}
          onChange={e=>setCap(e.target.value)}
        />
        <button onClick={add} disabled={!name.trim()}>Add</button>
      </div>
    </div>
  );
}
