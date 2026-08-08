import { useState } from 'react';
import { generateId } from '../../utils/helpers';
import './PetForm.css';

const emptyPet = {
  name: '',
  species: 'Dog',
  breed: '',
  age: '',
  gender: 'Male',
  weight: '',
  weightUnit: 'kg',  
  color: '',
  microchipId: '',
  dateOfBirth: '',
  allergies: [],  
  medications: [],
  veterinarian: { name: '', clinic: '', phone: '', email: '', address: '' },
};

export default function PetForm({ pet, onSubmit, onCancel }) {
  const isEdit = !!pet;
  const [form, setForm] = useState(pet || { ...emptyPet });
  const [allergyInput, setAllergyInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vet_')) {
      const key = name.replace('vet_', '');
      setForm((f) => ({ ...f, veterinarian: { ...f.veterinarian, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm((f) => ({ ...f, allergies: [...f.allergies, allergyInput.trim()] }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (idx) => {
    setForm((f) => ({ ...f, allergies: f.allergies.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const petData = {
      ...form,
      id: form.id || generateId(),
      age: Number(form.age),
      weight: Number(form.weight),
      photo: form.photo || null,
    };
    onSubmit(petData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Pet' : 'Add New Pet'}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        //
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Species</label>
                <select className="form-select" name="species" value={form.species} onChange={handleChange}>
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Bird</option>
                  <option>Fish</option>
                  <option>Rabbit</option>
                  <option>Hamster</option>
                  <option>Reptile</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Breed</label>
                <input className="form-input" name="breed" value={form.breed} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Age (years)</label>
                <input className="form-input" type="number" name="age" value={form.age} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight</label>
                <input className="form-input" type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Weight Unit</label>
                <select className="form-select" name="weightUnit" value={form.weightUnit} onChange={handleChange}>
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-input" name="color" value={form.color} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Microchip ID</label>
                <input className="form-input" name="microchipId" value={form.microchipId} onChange={handleChange} />
              </div>
            </div>

            <div className="form-section">
              <h4>Allergies</h4>
              <div className="inline-add">
                <input
                  className="form-input"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="Add allergy…"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <button type="button" className="btn btn-sm btn-secondary" onClick={addAllergy}>Add</button>
              </div>
              <div className="tag-list">
                {form.allergies.map((a, i) => (
                  <span key={i} className="badge badge-danger tag-removable" onClick={() => removeAllergy(i)}>
                    {a} ✕
                  </span>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h4>Veterinarian</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vet Name</label>
                  <input className="form-input" name="vet_name" value={form.veterinarian.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic</label>
                  <input className="form-input" name="vet_clinic" value={form.veterinarian.clinic} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="vet_phone" value={form.veterinarian.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="vet_email" value={form.veterinarian.email} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Pet'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
