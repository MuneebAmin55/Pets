import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import petsReducer from '../features/petsSlice';
import healthReducer from '../features/healthSlice';
import reminderReducer from '../features/reminderSlice';
import uiReducer from '../features/uiSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    pets: petsReducer,
    health: healthReducer,
    reminders: reminderReducer,
    ui: uiReducer,
  },
});

export default store;
