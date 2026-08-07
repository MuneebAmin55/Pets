import { daysUntil, isOverdue, isDueSoon, getReminderTypeColor } from '../../utils/helpers';
import './ReminderList.css';

export default function ReminderList({ reminders, onToggle, onDelete }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '4rem' }}>🔔</span>
        <h3>No Reminders</h3>
        <p>You&apos;re all caught up! Add a reminder to stay on track.</p>
      </div>
    );
  }

  const sorted = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="reminder-list">
      {sorted.map((rem) => {
        const overdue = isOverdue(rem.dueDate) && !rem.completed;
        const soon = isDueSoon(rem.dueDate) && !rem.completed;
        const colorClass = getReminderTypeColor(rem.type);

        return (
          <div
            key={rem.id}
            className={`reminder-card card ${rem.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
          >
            <div className="reminder-left">
              <button
                className={`reminder-check ${rem.completed ? 'checked' : ''}`}
                onClick={() => onToggle(rem.id)}
                aria-label="Toggle complete"
              >
                {rem.completed && '✓'}
              </button>
            </div>
            <div className="reminder-body">
              <div className="reminder-top">
                <span className={`badge badge-${colorClass}`}>{rem.type}</span>
                <span className={`reminder-due ${overdue ? 'text-danger' : soon ? 'text-warning' : ''}`}>
                  {daysUntil(rem.dueDate)}
                </span>
              </div>
              <h4 className="reminder-title">{rem.title}</h4>
              <p className="reminder-pet">🐾 {rem.petName}</p>
              {rem.notes && <p className="reminder-notes">{rem.notes}</p>}
            </div>
            <div className="reminder-actions">
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(rem.id)}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
