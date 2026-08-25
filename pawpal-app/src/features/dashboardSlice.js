import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { dashboardApi } from '../api/client'

export const loadDashboard = createAsyncThunk('dashboard/load', async () => {
  const { data } = await dashboardApi.get()
  return data
})

export const saveDashboard = createAsyncThunk('dashboard/save', async (dashboard) => {
  const { data } = await dashboardApi.save(dashboard)
  return data
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { completedCount: 0, status: 'idle', error: null },
  reducers: {
    setCompletedCount(state, action) { state.completedCount = action.payload },
    resetDashboardStatus(state) { state.status = 'idle'; state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(loadDashboard.fulfilled, (state, action) => { state.status = 'ready'; state.completedCount = action.payload.completedCount || 0 })
      .addCase(loadDashboard.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message })
      .addCase(saveDashboard.pending, (state) => { state.status = 'saving'; state.error = null })
      .addCase(saveDashboard.fulfilled, (state, action) => { state.status = 'ready'; state.completedCount = action.payload?.completedCount ?? state.completedCount })
      .addCase(saveDashboard.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message })
  },
})

export const { setCompletedCount, resetDashboardStatus } = dashboardSlice.actions
export const selectCompletedCount = (state) => state.dashboard.completedCount
export const selectDashboardStatus = (state) => state.dashboard.status
export default dashboardSlice.reducer
