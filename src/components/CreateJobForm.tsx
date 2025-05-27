import { useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

export default function Form({ onDone }: { onDone(): void }) {
  const [f, setF] = useState({
    customer_name: '',
    activity_type: 'Cut & Prep',
    hours_required: '1',
    color_code: '#3174ad',
    original_start_date_request: new Date().toISOString().slice(0, 10)
  });
  const change = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        await fetch(`${API}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...f, hours_required: parseFloat(f.hours_required) })
        });
        onDone();
      }}
    >
      <input placeholder="Customer" value={f.customer_name} onChange={change('customer_name')} />
      <input
        type="number"
        step="0.25"
        value={f.hours_required}
        onChange={change('hours_required')}
      />
      <button>Create</button>
    </form>
  );
}
