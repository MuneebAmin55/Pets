import { createSlice } from '@reduxjs/toolkit';
import { mockReminders } from '../api/mockData';

const initialState = {
  list: mockReminders,
};

const reminderSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    addReminder(state, action) {
      state.list.push(action.payload);
    },
    updateReminder(state, action) {
      const idx = state.list.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
    },
    removeReminder(state, action) {
      state.list = state.list.filter((r) => r.id !== action.payload);
    },
    toggleComplete(state, action) {
      const reminder = state.list.find((r) => r.id === action.payload);
      if (reminder) reminder.completed = !reminder.completed;
    },
  },
});

export const { addReminder, updateReminder, removeReminder, toggleComplete } = reminderSlice.actions;
export const selectReminders = (state) => state.reminders.list;
export const selectRemindersByPet = (petId) => (state) =>
  state.reminders.list.filter((r) => r.petId === petId);
export default reminderSlice.reducer;
