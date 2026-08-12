import { createSlice } from '@reduxjs/toolkit'

const healthSlice = createSlice({
  name: 'health',
  initialState: { records: {} },
  reducers: {
    setAllRecords(state, action) { state.records = action.payload },
    addRecord(state, action) {
      const { petId, record } = action.payload
      if (!state.records[petId]) state.records[petId] = []
      state.records[petId].push(record)
    },
    updateRecord(state, action) {
      const { petId, record } = action.payload
      const index = state.records[petId]?.findIndex((item) => item.id === record.id)
      if (index >= 0) state.records[petId][index] = { ...state.records[petId][index], ...record }
    },
    removeRecord(state, action) {
      const { petId, recordId } = action.payload
      if (state.records[petId]) state.records[petId] = state.records[petId].filter((record) => record.id !== recordId)
    },
    setRecords(state, action) { state.records[action.payload.petId] = action.payload.records },
  },
})

export const { setAllRecords, addRecord, updateRecord, removeRecord, setRecords } = healthSlice.actions
export const selectRecordsByPet = (petId) => (state) => state.health.records[petId] || []
export default healthSlice.reducer
