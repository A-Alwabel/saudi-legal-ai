import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { casesApi } from '@/services/unifiedApiService';

interface Case {
  id: string;
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  clientId: string;
  clientName?: string;
  assignedLawyerId: string;
  assignedLawyerName?: string;
  lawFirmId: string;
  courtId?: string;
  caseNumber?: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  successProbability?: number;
  estimatedValue?: number;
  actualValue?: number;
  notes: Array<{
    id: string;
    content: string;
    addedBy: string;
    addedByName?: string;
    addedAt: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  hearings: Array<{
    id: string;
    date: string;
    courtRoom?: string;
    judge?: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CasesState {
  cases: Case[];
  currentCase: Case | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  filters: {
    status?: string;
    caseType?: string;
    priority?: string;
    clientId?: string;
    assignedLawyerId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
}

const initialState: CasesState = {
  cases: [],
  currentCase: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: null,
  filters: {},
};

export const fetchCases = createAsyncThunk(
  'cases/fetchCases',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const cases = await casesApi.getAll(params);
      return {
        cases: cases || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: cases?.length || 0,
          totalPages: Math.ceil((cases?.length || 0) / (params.limit || 10))
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
    }
  }
);

export const fetchCase = createAsyncThunk(
  'cases/fetchCase',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await casesApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch case');
    }
  }
);

export const createCase = createAsyncThunk(
  'cases/createCase',
  async (caseData: Partial<Case>, { rejectWithValue }) => {
    try {
      const response = await casesApi.create(caseData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create case');
    }
  }
);

export const updateCase = createAsyncThunk(
  'cases/updateCase',
  async ({ id, caseData }: { id: string; caseData: Partial<Case> }, { rejectWithValue }) => {
    try {
      const updatedCase = await casesApi.update(id, caseData);
      return updatedCase;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update case');
    }
  }
);

export const deleteCase = createAsyncThunk(
  'cases/deleteCase',
  async (id: string, { rejectWithValue }) => {
    try {
      await casesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete case');
    }
  }
);

export const updateCaseStatus = createAsyncThunk(
  'cases/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const updatedCase = await casesApi.update(id, { status });
      return { id, status, case: updatedCase };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update case status');
    }
  }
);

export const addCaseNote = createAsyncThunk(
  'cases/addNote',
  async ({ id, note }: { id: string; note: string }, { rejectWithValue }) => {
    try {
      // Add note by updating the case with a new note
      const noteId = `note-${Date.now()}`;
      const newNote = {
        id: noteId,
        content: note,
        addedBy: 'current-user',
        addedByName: 'Current User',
        addedAt: new Date().toISOString()
      };
      const updatedCase = await casesApi.update(id, { notes: [newNote] });
      return { caseId: id, note: newNote };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add case note');
    }
  }
);

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<CasesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentCase: (state, action: PayloadAction<Case | null>) => {
      state.currentCase = action.payload;
    },
    updateCaseInList: (state, action: PayloadAction<Case>) => {
      const index = state.cases.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch cases
    builder
      .addCase(fetchCases.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cases = action.payload.cases;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single case
    builder
      .addCase(fetchCase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCase = action.payload;
        state.error = null;
      })
      .addCase(fetchCase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create case
    builder
      .addCase(createCase.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.isCreating = false;
        state.cases.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCase.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update case
    builder
      .addCase(updateCase.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.cases.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.cases[index] = action.payload;
        }
        if (state.currentCase?.id === action.payload.id) {
          state.currentCase = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCase.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete case
    builder
      .addCase(deleteCase.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.cases = state.cases.filter(c => c.id !== action.payload);
        if (state.currentCase?.id === action.payload) {
          state.currentCase = null;
        }
        state.error = null;
      })
      .addCase(deleteCase.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Update case status
    builder
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const { id, case: updatedCase } = action.payload;
        const index = state.cases.findIndex(c => c.id === id);
        if (index !== -1) {
          state.cases[index] = updatedCase;
        }
        if (state.currentCase?.id === id) {
          state.currentCase = updatedCase;
        }
      });

    // Add case note
    builder
      .addCase(addCaseNote.fulfilled, (state, action) => {
        const { caseId, note } = action.payload;
        const caseIndex = state.cases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
          state.cases[caseIndex].notes.push(note);
        }
        if (state.currentCase?.id === caseId) {
          state.currentCase.notes.push(note);
        }
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setCurrentCase, 
  updateCaseInList 
} = casesSlice.actions;

export default casesSlice.reducer;
