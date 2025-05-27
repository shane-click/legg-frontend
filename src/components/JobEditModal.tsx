import { useState } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';

const API = import.meta.env.VITE_API_BASE_URL;
Modal.setAppElement('#root');

export default function JobEditModal({
  job,
  onClose
}: {
  job: any;
  onClose(): void;
}) {
  const [form, setForm] = useState({
    customer_name: job.customer_name,
    quote_number: job.quote_number,
    hours_required: job.hours_required,
    activity_type: job.activity_type
  });

  const update = (k: string) => (e: any) =>
    setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    await fetch(`${API}/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onClose();            // refresh happens in parent
  };

  return (
    <Modal
      isOpen
      onRequestClose={onClose}
      contentLabel="Edit Job"
      style={{
        content: { maxWidth: 400, inset: '40px', margin: 'auto', borderRadius: 12 }
      }}
    >
      <h3>Edit Job</h3>

      <input
        placeholder="Customer"
        value={form.customer_name}
        onChange={update('customer_name')}
      />
      <input
        placeholder="Quote #"
        value={form.quote_number}
        onChange={update('quote_number')}
      />
      <input
        type="number"
        step="0.25"
        placeholder="Hours"
        value={form.hours_required}
        onChange={update('hours_required')}
      />
      <select value={form.activity_type} onChange={update('activity_type')}>
        {['Cut & Prep', 'Fab', 'Delivery', 'Other'].map(t => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={save}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
