import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoicesApi } from '../../services/unifiedApiService';

interface InvoicesState {
  invoices: any[];
  currentInvoice: any | null;
  isLoading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: InvoicesState = {
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  pagination: null,
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const invoices = await invoicesApi.getAll(params);
      return {
        invoices: invoices || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: invoices?.length || 0,
          totalPages: Math.ceil((invoices?.length || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = invoicesSlice.actions;
export default invoicesSlice.reducer;
