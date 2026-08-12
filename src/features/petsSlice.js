import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  list: [],
  loading: false,
  error: null,
};

const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    setPets(state, action) {
      state.list = action.payload;
    },
    addPet(state, action) {
      state.list.push(action.payload);
    },
    updatePet(state, action) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
    },
    removePet(state, action) {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setPets, addPet, updatePet, removePet, setLoading, setError } = petsSlice.actions;
export const selectPets = (state) => state.pets.list;
export const selectPetById = (id) => (state) => state.pets.list.find((p) => p.id === id);
export default petsSlice.reducer;
