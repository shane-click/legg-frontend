import { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export interface DraftJob {
  id: string;
  customer_name: string;
  quote_number: string;
  hours_required: number;
  activity_type: 'Cut & Prep' | 'Fab' | 'Delivery' | 'Other';
  color_code: string;
}

const ACT_TYPES: DraftJob['activity_type'][] = ['Cut & Prep', 'Fab', 'Delivery', 'Other'];

export default function JobModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose(): void;
  onSave(job: DraftJob): void;
}) {
  const [form, setForm] = useState({
    customer_name: '',
    quote_number: '',
    hours_required: '1',
    activity_type: 'Cut & Prep'
  });

  const update = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const save = () => {
    onSave({
      id: crypto.randomUUID(),
      customer_name: form.customer_name,
      quote_number: form.quote_number,
      hours_required: parseFloat(form.hours_required),
      activity_type: form.activity_type as DraftJob['activity_type'],
      color_code: '#3174ad'
    });
    onClose(); // reset handled by parent clearing modal
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create Job"
      style={{
        content: {
          maxWidth: 400,
          inset: '40px',
          margin: 'auto',
          borderRadius: '12px',
          padding: '20px'
        }
      }}
    >
      <h3>Create Job</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          placeholder="Customer name"
          value={form.customer_name}
          onChange={update('customer_name')}
        />
        <input placeholder="Quote #" value={form.quote_number} onChange={update('quote_number')} />
        <input
          type="number"
          step="0.25"
          placeholder="Hours"
          value={form.hours_required}
          onChange={update('hours_required')}
        />
        <select value={form.activity_type} onChange={update('activity_type')}>
          {ACT_TYPES.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button onClick={save} disabled={!form.customer_name.trim()}>
            Save
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
