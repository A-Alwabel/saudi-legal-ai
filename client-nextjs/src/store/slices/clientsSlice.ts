import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientsApi } from '../../services/unifiedApiService';

interface ClientsState {
  clients: any[];
  currentClient: any | null;
  isLoading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: ClientsState = {
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
  pagination: null,
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const clients = await clientsApi.getAll(params);
      return {
        clients: clients || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: clients?.length || 0,
          totalPages: Math.ceil((clients?.length || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload.clients;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = clientsSlice.actions;
export default clientsSlice.reducer;
