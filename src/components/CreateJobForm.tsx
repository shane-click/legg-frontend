import React, { useState } from 'react';
// If you have a shared types/models file, import Job. Otherwise, define a basic one here for now.
// Example: interface JobDetails { /* ... fields ... */ }

// These were defined in the previous detailed plan, keep them or adapt
const colorOptions = [
  { name: 'Blue', value: '#3174ad' }, { name: 'Green', value: '#3a9d5d' },
  { name: 'Red', value: '#c73e3a' }, { name: 'Purple', value: '#8e44ad' },
  { name: 'Orange', value: '#f39c12' }, { name: 'Teal', value: '#1abc9c' },
  { name: 'Pink', value: '#d81b60' }, { name: 'Lime', value: '#cddc39' },
  // Add more to reach ~15
];
const activityTypes = ['Cut & Prep', 'Fab', 'Delivery', 'Other']; // Matches ENUM from backend

interface CreateJobFormProps {
  // We'll make onJobCreated optional for now, or just console.log
  onJobCreated?: (jobData: any) => void; 
}

const CreateJobForm: React.FC<CreateJobFormProps> = ({ onJobCreated }) => {
  const [customerName, setCustomerName] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [activityType, setActivityType] = useState(activityTypes[0]);
  const [hoursRequired, setHoursRequired] = useState(''); // String for input, parse to number on submit
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  // Default to today's date in YYYY-MM-DD format
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); 
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For future API calls

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic Validation
    if (!customerName.trim()) {
      setError("Customer name is required.");
      setIsLoading(false);
      return;
    }
    if (!hoursRequired.trim()) {
      setError("Hours required is required.");
      setIsLoading(false);
      return;
    }
    const hours = parseFloat(hoursRequired);
    if (isNaN(hours) || hours <= 0) {
      setError("Hours required must be a positive number (e.g., 7 or 7.25).");
      setIsLoading(false);
      return;
    }
    if (!startDate) {
        setError("Preferred Start Date is required.");
        setIsLoading(false);
        return;
    }

    const jobData = {
      customer_name: customerName,
      quote_number: quoteNumber,
      activity_type: activityType,
      hours_required: hours, // Send as number
      color_code: selectedColor,
      original_start_date_request: startDate,
    };

    console.log("Submitting Job Data:", jobData);

    // --- Temporarily Comment out API Call ---
    /*
    // This is where you'd make the API call. We'll enable this later.
    // const { data: { session } } = await supabase.auth.getSession(); // Auth is removed for now
    // if (!session) { setError("Not logged in."); setIsLoading(false); return; }

    try {
      // const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      // const response = await fetch(`${VITE_API_BASE_URL}/jobs`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     // 'Authorization': `Bearer ${session.access_token}`, // Auth removed
      //   },
      //   body: JSON.stringify(jobData),
      // });

      // if (!response.ok) {
      //   const errData = await response.json();
      //   throw new Error(errData.message || `Failed to create job: ${response.statusText}`);
      // }
      // const newJob = await response.json();
      // console.log("Job created successfully:", newJob);
      // if (onJobCreated) {
      //   onJobCreated(newJob);
      // }
      // // Reset form
      // setCustomerName(''); setQuoteNumber(''); setHoursRequired(''); // etc.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    */

    // For now, just log and simulate success
    setTimeout(() => {
        setIsLoading(false);
        if (onJobCreated) onJobCreated(jobData); // Simulate callback with local data
        alert("Job data logged to console! (API call is currently disabled)");
        // Optionally reset form fields here
        // setCustomerName(''); setQuoteNumber(''); setHoursRequired(''); 
        // setActivityType(activityTypes[0]); setSelectedColor(colorOptions[0].value);
        // setStartDate(new Date().toISOString().split('T')[0]);
    }, 500);
  };

  // Basic styling for visibility (you're using Tailwind, so adapt this)
  const inputStyle = { display: 'block', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: 'calc(100% - 18px)'};
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '500px', margin: '20px auto', background: '#f9f9f9' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Create New Job</h3>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <div>
        <label style={labelStyle} htmlFor="customerName">Customer Name:</label>
        <input style={inputStyle} id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </div>
      
      <div>
        <label style={labelStyle} htmlFor="quoteNumber">Quote Number:</label>
        <input style={inputStyle} id="quoteNumber" type="text" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />
      </div>
      
      <div>
        <label style={labelStyle} htmlFor="activityType">Activity Type:</label>
        <select style={inputStyle} id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
          {activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      
      <div>
        <label style={labelStyle} htmlFor="hoursRequired">Hours Required (e.g., 7.25):</label>
        <input style={inputStyle} id="hoursRequired" type="number" step="0.01" value={hoursRequired} onChange={(e) => setHoursRequired(e.target.value)} />
      </div>
      
      <div>
        <label style={labelStyle} htmlFor="startDate">Preferred Start Date:</label>
        <input style={inputStyle} id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      
      <div>
        <label style={labelStyle} htmlFor="selectedColor">Color:</label>
        <select style={inputStyle} id="selectedColor" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
          {colorOptions.map(color => (
            <option key={color.value} value={color.value} style={{ backgroundColor: color.value, color: '#fff', textShadow:'0 0 2px #000' }}>
              {color.name}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading} 
        style={{ display: 'block', width: '100%', padding: '10px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {isLoading ? 'Submitting...' : 'Submit Job Data (Log to Console)'}
      </button>
    </form>
  );
};

export default CreateJobForm;
