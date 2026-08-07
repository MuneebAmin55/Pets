import { useNavigate } from 'react-router-dom';
import { getSpeciesEmoji } from '../../utils/helpers';
import './PetCard.css';

export default function PetCard({ pet }) {
  const navigate = useNavigate();

  return (
    <div className="pet-card card" onClick={() => navigate(`/pets/${pet.id}`)}>
      <div className="pet-card-photo">
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} />
        ) : (
          <div className="pet-card-placeholder">
            <span>{getSpeciesEmoji(pet.species)}</span>
          </div>
        )}
        <span className="pet-species-badge">{pet.species}</span>
      </div>
      <div className="pet-card-body">
        <h3 className="pet-card-name">{pet.name}</h3>
        <p className="pet-card-breed">{pet.breed}</p>
        <div className="pet-card-meta">
          <span className="meta-item">
            <span className="meta-icon">📅</span>
            {pet.age} {pet.age === 1 ? 'year' : 'years'}
          </span>
          <span className="meta-item">
            <span className="meta-icon">⚖️</span>
            {pet.weight} {pet.weightUnit}
          </span>
          <span className="meta-item">
            <span className="meta-icon">{pet.gender === 'Male' ? '♂️' : '♀️'}</span>
            {pet.gender}
          </span>
        </div>
        {pet.allergies && pet.allergies.length > 0 && (
          <div className="pet-card-tags">
            {pet.allergies.map((a) => (
              <span key={a} className="badge badge-danger">{a}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
