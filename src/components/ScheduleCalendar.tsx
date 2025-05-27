import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enAU from 'date-fns/locale/en-AU';
import { socket } from '../socket';
import type { DraftJob } from './JobModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const API = import.meta.env.VITE_API_BASE_URL;
const DnDCalendar = withDragAndDrop(Calendar);
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-AU': enAU }
});

export default function ScheduleCalendar({
  unscheduled,
  setUnscheduled
}: {
  unscheduled: DraftJob[];
  setUnscheduled(j: DraftJob[]): void;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [draftPicked, setDraftPicked] = useState<DraftJob | null>(null);

  /* ---------- fetch & realtime ---------- */
  const fetchJobs = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const in30 = format(new Date(Date.now() + 2.59e9), 'yyyy-MM-dd');
    const res = await fetch(`${API}/jobs?startDate=${today}&endDate=${in30}`);
    const rows = await res.json();

    setEvents(
      rows.flatMap((j: any) =>
        j.allocations.map((a: any) => {
          const start = new Date(`${a.allocation_date}T08:00`);
          const end = new Date(+start + a.allocated_hours * 3600000);
          return {
            id: j.id,
            title: `${j.customer_name} (${a.allocated_hours}h)`,
            start,
            end,
            resource: j
          };
        })
      )
    );
  };

  useEffect(() => {
    fetchJobs();
    const s = socket();
    s.on('schedule_updated', fetchJobs);
    return () => s.off('schedule_updated', fetchJobs);
  }, []);

  /* ---------- external drop handler ---------- */
  const onDropFromOutside = ({ start }: { start: Date }) => {
    if (!draftPicked) return;
    // 1. create job in DB
    fetch(`${API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draftPicked,
        original_start_date_request: format(start, 'yyyy-MM-dd')
      })
    })
      .then(r => r.json())
      .then(job => {
        // move it to chosen day via backend move route (simplifies chain-reaction)
        return fetch(`${API}/jobs/${job.id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newStartDate: format(start, 'yyyy-MM-dd') })
        });
      })
      .then(() => {
        setUnscheduled(unscheduled.filter(j => j.id !== draftPicked.id));
        setDraftPicked(null);
      });
  };

  return (
    <div style={{ height: 650 }}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        defaultView={Views.WEEK}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        step={60}
        onDropFromOutside={onDropFromOutside}
        draggableAccessor={() => false}
        eventPropGetter={ev => ({
          style: {
            backgroundColor: ev.resource.color_code,
            color: '#fff',
            borderRadius: 6
          }
        })}
        handleDragStart={() => null} // required by addon
      />
      {/* Let Unscheduled lane mark card as the one being dragged */}
      {/*
        onDragStart provided by addon is only for internal DnD; we use onMouseDown in card
      */}
    </div>
  );
}
