import { getRecordTypeIcon, formatDate } from '../../utils/helpers';
import './HealthRecordList.css';

export default function HealthRecordList({ records, onEdit, onDelete }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '4rem' }}>📋</span>
        <h3>No Health Records</h3>
        <p>Add your first health record to start tracking.</p>
      </div>
    );
  }

  const grouped = records.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const typeLabels = {
    vaccination: 'Vaccinations',
    medication: 'Medications',
    visit: 'Vet Visits',
    document: 'Documents',
  };

  return (
    <div className="health-records">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="record-group">
          <h3 className="record-group-title">
            {getRecordTypeIcon(type)} {typeLabels[type] || type}
            <span className="record-count">{items.length}</span>
          </h3>
          <div className="record-list">
            {items.map((record) => (
              <div key={record.id} className="record-item card">
                <div className="record-item-header">
                  <h4 className="record-title">{record.title}</h4>
                  <span className="record-date">{formatDate(record.date)}</span>
                </div>
                {record.veterinarian && (
                  <p className="record-vet">By {record.veterinarian}</p>
                )}
                {record.notes && <p className="record-notes">{record.notes}</p>}
                {record.nextDueDate && (
                  <p className="record-next">
                    <span className="badge badge-info">Next: {formatDate(record.nextDueDate)}</span>
                  </p>
                )}
                <div className="record-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => onEdit(record)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(record.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
