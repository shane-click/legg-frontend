import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { DraftJob } from './JobModal';

export default function UnscheduledLane({
  jobs,
  setJobs,
  onCardPicked
}: {
  jobs: DraftJob[];
  setJobs(j: DraftJob[]): void;
  onCardPicked(job: DraftJob): void;
}) {
  function onDragEnd(res: DropResult) {
    if (!res.destination) return; // dropped outside
    // we only care about external pick-up; calendar handles actual drop
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <h4>Unscheduled Jobs</h4>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="pool" direction="horizontal">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: 'flex', gap: 8, minHeight: 60 }}
            >
              {jobs.map((j, idx) => (
                <Draggable draggableId={j.id} index={idx} key={j.id}>
                  {p => (
                    <div
                      ref={p.innerRef}
                      {...p.draggableProps}
                      {...p.dragHandleProps}
                      onMouseDown={() => onCardPicked(j)}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        background: j.color_code,
                        color: '#fff',
                        ...p.draggableProps.style
                      }}
                    >
                      {j.customer_name} ({j.hours_required}h)
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
