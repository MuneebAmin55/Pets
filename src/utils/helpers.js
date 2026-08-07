import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date) => dayjs(date).format('MMM D, YYYY');

export const formatDateShort = (date) => dayjs(date).format('MM/DD/YY');

export const fromNow = (date) => dayjs(date).fromNow();

export const daysUntil = (date) => {
  const diff = dayjs(date).diff(dayjs(), 'day');
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
};

export const isOverdue = (date) => dayjs(date).isBefore(dayjs(), 'day');
export const isDueSoon = (date) => {
  const diff = dayjs(date).diff(dayjs(), 'day');
  return diff >= 0 && diff <= 7;
};

export const getPetAge = (dob) => {
  const years = dayjs().diff(dayjs(dob), 'year');
  const months = dayjs().diff(dayjs(dob), 'month') % 12;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months}mo` : ''}`;
};

export const getInitials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const generateId = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const getReminderTypeColor = (type) => {
  const map = {
    vaccination: 'info',
    medication: 'warning',
    grooming: 'primary',
    checkup: 'success',
  };
  return map[type] || 'info';
};

export const getRecordTypeIcon = (type) => {
  const map = {
    vaccination: '💉',
    medication: '💊',
    visit: '🏥',
    document: '📄',
  };
  return map[type] || '📋';
};

export const getSpeciesEmoji = (species) => {
  const map = {
    Dog: '🐕',
    Cat: '🐈',
    Bird: '🐦',
    Fish: '🐠',
    Rabbit: '🐰',
    Hamster: '🐹',
    Reptile: '🦎',
  };
  return map[species] || '🐾';
};
