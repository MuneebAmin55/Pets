import { useState } from 'react';
import { generateId } from '../../utils/helpers';

const emptyRecord = {
  petId: '',
  petName: '',
  type: 'vaccination',
  title: '',
  date: '',
  nextDueDate: '',
  veterinarian: '',
  notes: '',
};

export default function HealthRecordForm({ onSubmit, onCancel, record, pets }) {
  const isEdit = !!record;
  const [form, setForm] = useState(record || { ...emptyRecord });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'petId') {
      const pet = pets.find((item) => item.id === value);
      setForm((f) => ({ ...f, petId: value, petName: pet ? pet.name : '' }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, id: form.id || generateId() });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Record' : 'Add Health Record'}</h2>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Pet *</label>
                <select className="form-select" name="petId" value={form.petId} onChange={handleChange} required>
                  <option value="">Select a pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  <option value="vaccination">Vaccination</option>
                  <option value="medication">Medication</option>
                  <option value="visit">Vet Visit</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" name="date" value={form.date} onChange={handleChange} />
              </div>
              {(form.type === 'vaccination' || form.type === 'medication') && (
                <div className="form-group">
                  <label className="form-label">Next Due Date</label>
                  <input className="form-input" type="date" name="nextDueDate" value={form.nextDueDate} onChange={handleChange} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Veterinarian</label>
                <input className="form-input" name="veterinarian" value={form.veterinarian} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" name="notes" value={form.notes} onChange={handleChange} rows={3} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
