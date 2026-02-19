import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServiceLog, ServiceLogDraft, ServiceLogFormData } from '../../types';

interface ServiceLogsState {
  logs: ServiceLog[];
  drafts: ServiceLogDraft[];
  currentDraftId: string | null;
  formData: ServiceLogFormData | null;
}

const initialState: ServiceLogsState = {
  logs: [],
  drafts: [],
  currentDraftId: null,
  formData: null,
};

const serviceLogsSlice = createSlice({
  name: 'serviceLogs',
  initialState,
  reducers: {
    createDraft: (state, action: PayloadAction<ServiceLogDraft>) => {
      const existingIndex = state.drafts.findIndex(d => d.id === action.payload.id);
      if (existingIndex >= 0) {
        state.drafts[existingIndex] = action.payload;
      } else {
        state.drafts.push(action.payload);
      }
      state.currentDraftId = action.payload.id;
    },
    updateDraft: (state, action: PayloadAction<Partial<ServiceLogDraft> & { id: string }>) => {
      const draft = state.drafts.find(d => d.id === action.payload.id);
      if (draft) {
        Object.assign(draft, action.payload);
        draft.isSaved = false;
      }
    },
    saveDraft: (state, action: PayloadAction<{ id: string }>) => {
      const draft = state.drafts.find(d => d.id === action.payload.id);
      if (draft) {
        draft.isSaved = true;
        draft.lastSaved = new Date().toISOString();
      }
    },
    deleteDraft: (state, action: PayloadAction<{ id: string }>) => {
      state.drafts = state.drafts.filter(d => d.id !== action.payload.id);
      if (state.currentDraftId === action.payload.id) {
        state.currentDraftId = null;
      }
    },
    clearAllDrafts: (state) => {
      state.drafts = [];
      state.currentDraftId = null;
    },
    createServiceLog: (state, action: PayloadAction<ServiceLog>) => {
      state.logs.push(action.payload);
    },
    updateServiceLog: (state, action: PayloadAction<ServiceLog>) => {
      const index = state.logs.findIndex(log => log.id === action.payload.id);
      if (index >= 0) {
        state.logs[index] = action.payload;
      }
    },
    deleteServiceLog: (state, action: PayloadAction<{ id: string }>) => {
      state.logs = state.logs.filter(log => log.id !== action.payload.id);
    },
    setCurrentDraftId: (state, action: PayloadAction<string | null>) => {
      state.currentDraftId = action.payload;
    },
    setFormData: (state, action: PayloadAction<ServiceLogFormData | null>) => {
      state.formData = action.payload;
    },
  },
});

export const {
  createDraft,
  updateDraft,
  saveDraft,
  deleteDraft,
  clearAllDrafts,
  createServiceLog,
  updateServiceLog,
  deleteServiceLog,
  setCurrentDraftId,
  setFormData,
} = serviceLogsSlice.actions;

export default serviceLogsSlice.reducer;

