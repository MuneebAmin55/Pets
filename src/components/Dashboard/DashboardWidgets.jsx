import { useSelector } from 'react-redux';
import { selectPets } from '../../features/petsSlice';
import { selectReminders } from '../../features/reminderSlice';
import { isDueSoon, isOverdue, daysUntil, getSpeciesEmoji, formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import './DashboardWidgets.css';

export function StatsGrid() {
  const pets = useSelector(selectPets);
  const reminders = useSelector(selectReminders);
  const upcoming = reminders.filter((r) => !r.completed && isDueSoon(r.dueDate));
  const overdue = reminders.filter((r) => !r.completed && isOverdue(r.dueDate));

  const stats = [
    { label: 'Total Pets', value: pets.length, icon: '🐾', color: 'primary' },
    { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'info' },
    { label: 'Overdue', value: overdue.length, icon: '⚠️', color: 'danger' },
    { label: 'Completed', value: reminders.filter((r) => r.completed).length, icon: '✅', color: 'success' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div key={s.label} className={`stat-card glass`}>
          <span className="stat-icon">{s.icon}</span>
          <div className="stat-info">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UpcomingTasks() {
  const reminders = useSelector(selectReminders);
  const navigate = useNavigate();
  const upcoming = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="widget card">
      <div className="widget-header">
        <h3>📅 Upcoming Tasks</h3>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/reminders')}>View All</button>
      </div>
      <div className="widget-body">
        {upcoming.length === 0 ? (
          <p className="widget-empty">No upcoming tasks! 🎉</p>
        ) : (
          <ul className="task-list">
            {upcoming.map((rem) => (
              <li key={rem.id} className={`task-item ${isOverdue(rem.dueDate) ? 'overdue' : ''}`}>
                <div className="task-info">
                  <span className="task-title">{rem.title}</span>
                  <span className="task-pet">🐾 {rem.petName}</span>
                </div>
                <span className={`task-due ${isOverdue(rem.dueDate) ? 'text-danger' : isDueSoon(rem.dueDate) ? 'text-warning' : ''}`}>
                  {daysUntil(rem.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function RecentActivity() {
  const health = useSelector((state) => state.health.records);
  const allRecords = Object.values(health).flat();
  const recent = [...allRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="widget card">
      <div className="widget-header">
        <h3>🕐 Recent Activity</h3>
      </div>
      <div className="widget-body">
        {recent.length === 0 ? (
          <p className="widget-empty">No recent activity.</p>
        ) : (
          <ul className="activity-list">
            {recent.map((r) => (
              <li key={r.id} className="activity-item">
                <span className="activity-icon">
                  {r.type === 'vaccination' ? '💉' : r.type === 'medication' ? '💊' : r.type === 'visit' ? '🏥' : '📄'}
                </span>
                <div className="activity-info">
                  <span className="activity-title">{r.title}</span>
                  <span className="activity-date">{formatDate(r.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function PetQuickAccess() {
  const pets = useSelector(selectPets);
  const navigate = useNavigate();

  return (
    <div className="widget card">
      <div className="widget-header">
        <h3>🐾 Your Pets</h3>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/pets')}>Manage</button>
      </div>
      <div className="widget-body">
        <div className="quick-pets">
          {pets.map((pet) => (
            <div key={pet.id} className="quick-pet" onClick={() => navigate(`/pets/${pet.id}`)}>
              <div className="quick-pet-avatar">
                {getSpeciesEmoji(pet.species)}
              </div>
              <span className="quick-pet-name">{pet.name}</span>
              <span className="quick-pet-breed">{pet.breed}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
