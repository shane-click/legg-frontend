import JobEditModal from './JobEditModal';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDnD from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enAU from 'date-fns/locale/en-AU';
import Modal from './JobEditModal';
import { socket } from '../socket';
import type { DraftJob } from './JobModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const API = import.meta.env.VITE_API_BASE_URL;
const DnDCalendar = withDnD(Calendar);
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-AU': enAU }
});

/* ---------------- day-header component showing staff ---------------- */
const StaffHeader = ({ date }: { date: Date }) => {
  const [staff, setStaff] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/staff/day/${format(date, 'yyyy-MM-dd')}`)
      .then(r => r.json())
      .then(setStaff);
  }, [date]);

  const total = staff.reduce(
    (t: number, s: any) => t + (s.day_capacity_override ?? s.default_daily_capacity),
    0
  );

  return (
    <div style={{ textAlign: 'center', fontSize: 11 }}>
      <div>{format(date, 'EEE d')}</div>
      {staff.map((s: any) => (
        <div key={s.name}>
          {s.name} {s.day_capacity_override ?? s.default_daily_capacity}h
        </div>
      ))}
      <strong>{total}h</strong>
    </div>
  );
};

/* -------------------------------------------------------------------- */

export default function ScheduleCalendar({
  unscheduled,
  setUnscheduled
}: {
  unscheduled: DraftJob[];
  setUnscheduled(j: DraftJob[]): void;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [draft, setDraft] = useState<DraftJob | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  /* -------- load jobs ---------- */
  const load = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const in30 = format(new Date(Date.now() + 2.59e9), 'yyyy-MM-dd');
    const rows = await fetch(`${API}/jobs?startDate=${today}&endDate=${in30}`).then(r => r.json());

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
    load();
    const s = socket();
    s.on('schedule_updated', load);
    return () => s.off('schedule_updated', load);
  }, []);

  /* -------- external drag helpers ---------- */
  const dragFromOutsideItem = () =>
    draft
      ? {
          title: draft.customer_name,
          start: new Date(),
          end: new Date()
        }
      : null;

  const onDropFromOutside = ({ start }: { start: Date }) => {
    if (!draft) return;
    fetch(`${API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        original_start_date_request: format(start, 'yyyy-MM-dd')
      })
    })
      .then(r => r.json())
      .then(job =>
        fetch(`${API}/jobs/${job.id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newStartDate: format(start, 'yyyy-MM-dd') })
        })
      )
      .then(() => {
        setUnscheduled(unscheduled.filter(j => j.id !== draft.id));
        setDraft(null);
      });
  };

  return (
    <>
      <div style={{ height: 650 }}>
        <DnDCalendar
          components={{ header: StaffHeader }}
          localizer={localizer}
          events={events}
          defaultView={Views.WEEK}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          step={60}
          dragFromOutsideItem={dragFromOutsideItem}
          onDropFromOutside={onDropFromOutside}
          onDragOver={e => e.preventDefault()}
          draggableAccessor={() => false}
          selectable
          onSelectEvent={ev => setEditing(ev.resource)}
          eventPropGetter={ev => ({
            style: {
              backgroundColor: ev.resource.color_code,
              color: '#fff',
              borderRadius: 6
            }
          })}
        />
      </div>

      {editing && (
        <Modal
          job={editing}
          onClose={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

export const setPickedDraft = (j: DraftJob | null) => {
  /* helper to set 'draft' from UnscheduledLane */
};
