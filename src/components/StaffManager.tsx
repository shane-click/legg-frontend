import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;
interface Staff { id:number; name:string; default_daily_capacity:number }

export default function StaffManager() {
  const [staff,setStaff]=useState<Staff[]>([]);
  const [name,setName]=useState(''); const [cap,setCap]=useState('7');
  const [err,setErr]=useState<string|null>(null);

  const load=()=>fetch(`${API}/staff`).then(r=>r.json()).then(setStaff).catch(e=>setErr(e+""));
  useEffect(load,[]);

  const add=()=>fetch(`${API}/staff`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,default_daily_capacity:parseFloat(cap)})
  }).then(()=>{setName('');setCap('7');load();}).catch(e=>setErr(e+""));

  return(
    <div style={{border:'1px solid #ccc',borderRadius:8,padding:12,maxWidth:350,marginTop:20}}>
      <h3>Staff</h3>{err&&<p style={{color:'red',fontSize:12}}>{err}</p>}
      <ul style={{listStyle:'none',padding:0}}>
        {staff.map(s=><li key={s.id} style={{display:'flex',justifyContent:'space-between'}}>
          <span>{s.name}</span><span style={{fontSize:12,color:'#666'}}>{s.default_daily_capacity} h</span>
        </li>)}
      </ul>
      <div style={{display:'flex',gap:6,marginTop:8}}>
        <input style={{flex:1}} placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>
        <input type="number" step="0.25" style={{width:60}} value={cap} onChange={e=>setCap(e.target.value)}/>
        <button onClick={add} disabled={!name.trim()}>Add</button>
      </div>
    </div>
  );
}
