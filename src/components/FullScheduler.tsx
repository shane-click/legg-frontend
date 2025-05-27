import { useEffect, useState, useRef } from 'react';
import FullCalendar, {
  DateSelectArg,
  EventReceiveArg,
  EventClickArg
} from '@fullcalendar/react';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import { format } from 'date-fns';
import Modal from './JobEditModal';
import type { DraftJob } from './JobModal';
import { socket } from '../socket';

import '@fullcalendar/core/index.global.css';
import '@fullcalendar/timegrid/index.global.css';
import '@fullcalendar/daygrid/index.global.css';
import '@fullcalendar/resource-timegrid/index.global.css';

const API = import.meta.env.VITE_API_BASE_URL;

/* --- external pool made draggable ---------------------------------- */
export function makePoolDraggable(el: HTMLElement) {
  new Draggable(el, {
    itemSelector: '.pool-card',
    eventData: (domEl: HTMLElement) => ({
      title: domEl.innerText,
      extendedProps: {
        draftId: domEl.dataset.id,
        hours: parseFloat(domEl.dataset.hours!)
      },
      duration: { hours: parseFloat(domEl.dataset.hours!) }
    })
  });
}

/* ------------------------------------------------------------------- */
export default function FullScheduler({
  pool,
  unscheduled,
  setUnscheduled
}: {
  pool: HTMLElement;
  unscheduled: DraftJob[];
  setUnscheduled(j: DraftJob[]): void;
}) {
  const calRef = useRef<FullCalendar>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  /* make pool draggable once DOM ready */
  useEffect(() => {
    if (pool) makePoolDraggable(pool);
  }, [pool]);

  /* load staff as resources */
  useEffect(() => {
    fetch(`${API}/staff`)
      .then(r => r.json())
      .then((rows: any[]) =>
        setResources(
          rows.map(s => ({
            id: s.id,
            title: s.name,
            extendedProps: { defaultCap: s.default_daily_capacity }
          }))
        )
      );
  }, []);

  /* load jobs */
  const load = () => {
    const d0 = format(new Date(), 'yyyy-MM-dd');
    const d1 = format(new Date(Date.now() + 2.59e9), 'yyyy-MM-dd');
    fetch(`${API}/jobs?startDate=${d0}&endDate=${d1}`)
      .then(r => r.json())
      .then((rows: any[]) =>
        setEvents(
          rows.flatMap(j =>
            j.allocations.map((a: any) => ({
              id: j.id,
              title: j.customer_name,
              resourceId: a.staff_id ?? '',
              start: a.allocation_date + 'T08:00',
              end:
                a.allocation_date +
                'T' +
                String(8 + a.allocated_hours).padStart(2, '0') +
                ':00',
              extendedProps: { ...j, allocated_hours: a.allocated_hours }
            }))
          )
        )
      );
  };
  useEffect(load, []);
  useEffect(() => {
    const s = socket();
    s.on('schedule_updated', load);
    return () => s.off('schedule_updated', load);
  }, []);

  /* receive external drop */
  const handleReceive = async (info: EventReceiveArg) => {
    const { draftId, hours } = info.event.extendedProps;
    const draft = unscheduled.find(j => j.id === draftId);
    if (!draft) return;

    /* 1. create job */
    const job = await fetch(`${API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        original_start_date_request: format(info.event.start!, 'yyyy-MM-dd')
      })
    }).then(r => r.json());

    /* 2. move (backend handles capacity / push-forward) */
    await fetch(`${API}/jobs/${job.id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newStartDate: format(info.event.start!, 'yyyy-MM-dd')
      })
    });

    /* 3. remove from pool */
    setUnscheduled(unscheduled.filter(j => j.id !== draftId));
  };

  /* edit modal */
  const openEdit = (arg: EventClickArg) => {
    setEditing(arg.event.extendedProps);
  };

  return (
    <>
      <FullCalendar
        ref={calRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          resourceTimeGridPlugin,
          interactionPlugin
        ]}
        initialView="resourceTimeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridWeek'
        }}
        resources={resources}
        events={events}
        height="auto"
        droppable
        eventReceive={handleReceive}
        eventClick={openEdit}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
      />

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
