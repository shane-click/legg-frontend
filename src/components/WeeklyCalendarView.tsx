import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns'; // date-fns is great for this

// Define a basic structure for a job for the frontend view
// This should eventually align with what your backend API returns
interface MockJob {
  id: string; // Using string for mock data, can be number
  customer_name: string;
  activity_type: string;
  hours_required: number;
  color_code: string;
  // For this mock-up, let's assume jobs are simply assigned to a single start date
  // Later, this will come from job_allocations and can span multiple days
  startDate: string; // Format 'YYYY-MM-DD'
}

// --- MOCK DATA ---
// Replace this with API data later
const MOCK_JOBS: MockJob[] = [
  { id: 'job1', customer_name: 'Alice Wonderland', activity_type: 'Cut & Prep', hours_required: 8, color_code: '#3174ad', startDate: new Date().toISOString().split('T')[0] }, // Today
  { id: 'job2', customer_name: 'Bob The Builder', activity_type: 'Fab', hours_required: 6.5, color_code: '#3a9d5d', startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd') }, // Tomorrow
  { id: 'job3', customer_name: 'Charlie Brown', activity_type: 'Delivery', hours_required: 4, color_code: '#c73e3a', startDate: new Date().toISOString().split('T')[0] }, // Today
  { id: 'job4', customer_name: 'Diana Prince', activity_type: 'Other', hours_required: 7.25, color_code: '#8e44ad', startDate: format(addDays(new Date(), -1), 'yyyy-MM-dd') }, // Yesterday
  { id: 'job5', customer_name: 'Edward Scissorhands', activity_type: 'Cut & Prep', hours_required: 5, color_code: '#f39c12', startDate: format(addDays(new Date(), 2), 'yyyy-MM-dd') }, // Day after tomorrow
];
// --- END MOCK DATA ---


const WeeklyCalendarView: React.FC = () => {
  // State for the current date, which determines the week displayed
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate the start and end of the current week based on `currentDate`
  // Melbourne: Monday is typically the start of the week.
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 1 for Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Generate an array of Date objects for each day in the current week
  const daysInWeek = useMemo(() => {
    const days = [];
    let day = weekStart;
    while (day <= weekEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [weekStart, weekEnd]);

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  // Basic styling (replace with Tailwind classes)
  const containerStyle: React.CSSProperties = { fontFamily: 'Arial, sans-serif', padding: '20px' };
  const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '20px' };
  const navButtonStyle: React.CSSProperties = { margin: '0 10px', padding: '8px 15px', cursor: 'pointer' };
  const weekDaysContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', border: '1px solid #eee', background: '#f9f9f9' };
  const dayColumnStyle: React.CSSProperties = { flex: 1, borderLeft: '1px solid #eee', padding: '10px', minHeight: '400px' };
  const dayHeaderStyle: React.CSSProperties = { textAlign: 'center', paddingBottom: '10px', borderBottom: '1px solid #ddd', marginBottom: '10px', background: '#f0f0f0', padding: '5px 0'};
  const jobCardStyle: React.CSSProperties = { 
    padding: '10px', 
    margin: '5px 0', 
    border: '1px solid #ccc', 
    borderRadius: '4px', 
    fontSize: '0.9em' 
    // backgroundColor will be set by job.color_code
};

  return (
    <div style={containerStyle} className="p-4 md:p-6 lg:p-8"> {/* Example Tailwind: p-4 */}
      <div style={headerStyle} className="text-center mb-6">
        <h2 className="text-2xl font-bold">Weekly Schedule</h2>
        <p className="text-lg">{format(weekStart, 'MMM d, yyyy')} - {format(weekEnd, 'MMM d, yyyy')}</p>
        <div>
          <button style={navButtonStyle} onClick={goToPreviousWeek} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded shadow">
            &lt; Previous Week
          </button>
          <button style={navButtonStyle} onClick={goToCurrentWeek} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow">
            Current Week
          </button>
          <button style={navButtonStyle} onClick={goToNextWeek} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded shadow">
            Next Week &gt;
          </button>
        </div>
      </div>

      <div style={weekDaysContainerStyle} className="flex flex-row justify-between border border-gray-200 bg-gray-50 rounded-lg shadow">
        {daysInWeek.map((day, index) => {
          // Filter mock jobs for the current day in the loop
          const jobsForThisDay = MOCK_JOBS.filter(job => 
            isSameDay(parseISO(job.startDate), day)
          );

          return (
            <div 
              key={day.toISOString()} 
              style={{...dayColumnStyle, ...(index === 0 ? { borderLeft: 'none' } : {}) }}
              // Example Tailwind: flex-1 p-2 border-l border-gray-200 (first:border-l-0)
              className={`flex-1 p-2 sm:p-3 ${index > 0 ? 'border-l border-gray-200' : ''} min-h-[400px]`}
            >
              <div style={dayHeaderStyle} className="text-center pb-2 border-b border-gray-300 mb-2 bg-gray-100 p-1 rounded-t">
                <strong className="block text-sm sm:text-base">{format(day, 'EEE')}</strong> {/* Mon, Tue */}
                <span className="block text-xs sm:text-sm text-gray-600">{format(day, 'd MMM')}</span> {/* 1 Jun */}
              </div>
              <div>
                {jobsForThisDay.length > 0 ? (
                  jobsForThisDay.map(job => (
                    <div 
                      key={job.id} 
                      style={{ ...jobCardStyle, backgroundColor: job.color_code }}
                      // Example Tailwind: p-2 my-1 border rounded text-xs (bg set by style)
                      className="p-2 my-1 border border-gray-300 rounded text-xs shadow hover:shadow-md transition-shadow"
                    >
                      <strong className="block text-white mix-blend-difference font-semibold">{job.customer_name}</strong>
                      <span className="block text-white mix-blend-difference">{job.activity_type}</span>
                      <span className="block text-white mix-blend-difference">({job.hours_required} hrs)</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center mt-4">No jobs</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
