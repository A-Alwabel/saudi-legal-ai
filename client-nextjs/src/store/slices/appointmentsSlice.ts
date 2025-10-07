import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentsApi } from '../../services/unifiedApiService';

interface AppointmentsState {
  appointments: any[];
  currentAppointment: any | null;
  isLoading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
  pagination: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await appointmentsApi.getAppointments(params);
      return { appointments: response.data.data, pagination: response.data.pagination };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload.appointments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
