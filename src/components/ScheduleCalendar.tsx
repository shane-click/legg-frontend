import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enAU from 'date-fns/locale/en-AU';
import { supabase } from '../supabaseClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const API = import.meta.env.VITE_API_BASE_URL;

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-AU': enAU }
});

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: any;
}

export default function ScheduleCalendar() {
  const [events, setEvents] = useState<Event[]>([]);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const today = new Date();
    const in30  = new Date(+today + 1000*60*60*24*30);
    const qs = `startDate=${format(today,'yyyy-MM-dd')}&endDate=${format(in30,'yyyy-MM-dd')}`;
    const r = await fetch(`${API}/jobs?${qs}`, {
      headers: { Authorization: `Bearer ${session!.access_token}` }
    });
    const rows = await r.json();
    const evts: Event[] = rows.flatMap((j: any) =>
      j.allocations.map((a: any) => {
        const start = new Date(`${a.allocation_date}T08:00`);
        const end   = new Date(+start + a.allocated_hours*60*60*1000);
        return {
          id: j.id,
          title: `${j.customer_name} (${a.allocated_hours}h)`,
          start,
          end,
          resource: j
        };
      })
    );
    setEvents(evts);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{height:600,marginTop:20}}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.WEEK}
        views={[Views.DAY,Views.WEEK,Views.MONTH]}
        step={60}
        eventPropGetter={ev=>({
          style:{backgroundColor:ev.resource.color_code,color:'#fff',borderRadius:6}
        })}
      />
    </div>
  );
}
