import { createSlice } from '@reduxjs/toolkit';
import { mockHealthRecords } from '../api/mockData';

const initialState = {
  records: mockHealthRecords, // keyed by petId → array of records
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    addRecord(state, action) {
      const { petId, record } = action.payload;
      if (!state.records[petId]) state.records[petId] = [];
      state.records[petId].push(record);
    },
    updateRecord(state, action) {
      const { petId, record } = action.payload;
      const list = state.records[petId];
      if (list) {
        const idx = list.findIndex((r) => r.id === record.id);
        if (idx !== -1) list[idx] = { ...list[idx], ...record };
      }
    },
    removeRecord(state, action) {
      const { petId, recordId } = action.payload;
      if (state.records[petId]) {
        state.records[petId] = state.records[petId].filter((r) => r.id !== recordId);
      }
    },
    setRecords(state, action) {
      const { petId, records } = action.payload;
      state.records[petId] = records;
    },
  },
});

export const { addRecord, updateRecord, removeRecord, setRecords } = healthSlice.actions;
export const selectRecordsByPet = (petId) => (state) => state.health.records[petId] || [];
export default healthSlice.reducer;
