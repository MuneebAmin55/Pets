import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../api/client'

const sessionUser = (data) => {
  if (data.token) localStorage.setItem('pawpal_token', data.token)
  if (data.user) localStorage.setItem('pawpal_user', JSON.stringify(data.user))
  return data.user || data
}

const initialToken = localStorage.getItem('pawpal_token')
const initialUser = (() => {
  try {
    const stored = localStorage.getItem('pawpal_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
})()

export const loginUser = createAsyncThunk('user/loginUser', async (credentials) => {
  const { data } = await authApi.login(credentials)
  return sessionUser(data)
})

export const registerUser = createAsyncThunk('user/registerUser', async (details) => {
  const { data } = await authApi.register(details)
  return sessionUser(data)
})

export const requestPasswordReset = createAsyncThunk('user/requestPasswordReset', async (email) => {
  await authApi.requestPasswordReset(email)
})

export const verifyPasswordResetOtp = createAsyncThunk('user/verifyPasswordResetOtp', async (payload) => {
  const { data } = await authApi.verifyPasswordResetOtp(payload)
  return data
})

export const completePasswordReset = createAsyncThunk('user/completePasswordReset', async (payload) => {
  const { data } = await authApi.completePasswordReset(payload)
  return data
})

const userSlice = createSlice({
  name: 'user',
  initialState: { isAuthenticated: Boolean(initialToken || initialUser), user: initialUser, loading: false, error: null },
  reducers: {
    login(state, action) { state.isAuthenticated = true; state.user = action.payload },
    logout(state) { localStorage.removeItem('pawpal_token'); localStorage.removeItem('pawpal_user'); state.isAuthenticated = false; state.user = null },
    updateProfile(state, action) { state.user = { ...state.user, ...action.payload } },
    togglePremium(state) { if (state.user) state.user.isPremium = !state.user.isPremium },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher((action) => action.type.startsWith('user/') && action.type.endsWith('/pending'), (state) => { state.loading = true; state.error = null })
      .addMatcher((action) => action.type.startsWith('user/') && action.type.endsWith('/fulfilled'), (state, action) => {
        state.loading = false
        if (action.payload) { state.isAuthenticated = true; state.user = action.payload }
      })
      .addMatcher((action) => action.type.startsWith('user/') && action.type.endsWith('/rejected'), (state, action) => { state.loading = false; state.error = action.error.message || 'Request failed' })
  },
})

export const { login, logout, updateProfile, togglePremium } = userSlice.actions
export const selectUser = (state) => state.user.user
export const selectIsAuth = (state) => state.user.isAuthenticated
export const selectAuthLoading = (state) => state.user.loading
export default userSlice.reducer
