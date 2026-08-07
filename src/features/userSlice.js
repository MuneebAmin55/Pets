import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null, // { id, name, email, avatar, role, isPremium }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    updateProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    togglePremium(state) {
      if (state.user) state.user.isPremium = !state.user.isPremium;
    },
  },
});

export const { login, logout, updateProfile, togglePremium } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export const selectIsAuth = (state) => state.user.isAuthenticated;
export default userSlice.reducer;
