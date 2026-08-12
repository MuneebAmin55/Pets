import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import petsReducer from '../features/petsSlice';
import healthReducer from '../features/healthSlice';
import reminderReducer from '../features/reminderSlice';
import uiReducer from '../features/uiSlice';
import dashboardReducer from '../features/dashboardSlice';
import documentsReducer from '../features/documentSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    pets: petsReducer,
    health: healthReducer,
    reminders: reminderReducer,
    ui: uiReducer,
    dashboard: dashboardReducer,
    documents: documentsReducer,
  },
});

export default store;
