import { formatDate, getRecordTypeIcon } from '../../utils/helpers';
import './HealthTimeline.css';

export default function HealthTimeline({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '4rem' }}>📅</span>
        <h3>No Timeline Events</h3>
        <p>Health events will appear here as you add records.</p>
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="health-timeline">
      {sorted.map((record, i) => (
        <div key={record.id} className="timeline-item" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="timeline-marker">
            <span className="timeline-icon">{getRecordTypeIcon(record.type)}</span>
            {i < sorted.length - 1 && <div className="timeline-line" />}
          </div>
          <div className="timeline-content card">
            <div className="timeline-header">
              <span className={`badge badge-${record.type === 'vaccination' ? 'info' : record.type === 'medication' ? 'warning' : record.type === 'visit' ? 'success' : 'primary'}`}>
                {record.type}
              </span>
              <span className="timeline-date">{formatDate(record.date)}</span>
            </div>
            <h4 className="timeline-title">{record.title}</h4>
            {record.notes && <p className="timeline-notes">{record.notes}</p>}
            {record.veterinarian && (
              <p className="timeline-vet">🩺 {record.veterinarian}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
