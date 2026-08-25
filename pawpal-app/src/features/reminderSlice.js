import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  list: [],
};

const reminderSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setReminders(state, action) {
      state.list = action.payload;
    },
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

export const { setReminders, addReminder, updateReminder, removeReminder, toggleComplete } = reminderSlice.actions;
export const selectReminders = (state) => state.reminders.list;
export const selectRemindersByPet = (petId) => (state) =>
  state.reminders.list.filter((r) => r.petId === petId);
export default reminderSlice.reducer;
