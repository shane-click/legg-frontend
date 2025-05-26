import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { socket } from '../socket';
import { startOfWeek, addDays, format } from 'date-fns';

const API = import.meta.env.VITE_API_BASE_URL;
const dayCols = (d = new Date()) =>
  [...Array(7)].map((_, i) => format(addDays(startOfWeek(d, { weekStartsOn: 1 }), i), 'yyyy-MM-dd'));

export default function Weekly() {
  const [data, setData] = useState<any[]>([]);
  const load = async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const qs = `startDate=${dayCols()[0]}&endDate=${dayCols()[6]}`;
    const r = await fetch(`${API}/jobs?${qs}`, {
      headers: { Authorization: `Bearer ${session!.access_token}` }
    });
    setData(await r.json());
  };
  useEffect(() => {
    load();
    const s = socket();
    s.on('schedule_updated', load);
    return () => s.off('schedule_updated', load);
  }, []);
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {dayCols().map(day => (
        <div key={day} style={{ flex: 1 }}>
          <h4>{day}</h4>
          {data
            .filter(j => j.allocations.some((a: any) => a.allocation_date === day))
            .map(j => (
              <div key={j.id} style={{ background: j.color_code, margin: 4, padding: 4 }}>
                {j.customer_name} – {j.hours_required}h
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
