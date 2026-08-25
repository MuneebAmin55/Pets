import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { documentsApi } from '../api/client'

export const loadDocuments = createAsyncThunk('documents/loadDocuments', async () => {
  const { data } = await documentsApi.get()
  return data
})

export const createDocument = createAsyncThunk('documents/createDocument', async (payload) => {
  const { data } = await documentsApi.create(payload)
  return data.document
})

export const deleteDocument = createAsyncThunk('documents/deleteDocument', async (id) => {
  await documentsApi.remove(id)
  return id
})

const documentSlice = createSlice({
  name: 'documents',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {
    clearDocumentsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocuments.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.status = 'ready'
        state.list = Array.isArray(action.payload.documents) ? action.payload.documents : []
      })
      .addCase(loadDocuments.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message
      })
      .addCase(createDocument.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.status = 'ready'
        state.list = [action.payload, ...state.list]
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message
      })
      .addCase(deleteDocument.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.status = 'ready'
        state.list = state.list.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message
      })
  },
})

export const { clearDocumentsError } = documentSlice.actions
export const selectDocuments = (state) => state.documents.list
export const selectDocumentsStatus = (state) => state.documents.status
export const selectDocumentsError = (state) => state.documents.error
export default documentSlice.reducer
