import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeesApi } from '../../services/unifiedApiService';

interface EmployeesState {
  employees: any[];
  currentEmployee: any | null;
  isLoading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: EmployeesState = {
  employees: [],
  currentEmployee: null,
  isLoading: false,
  error: null,
  pagination: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const employees = await employeesApi.getAll(params);
      return {
        employees: employees || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: employees?.length || 0,
          totalPages: Math.ceil((employees?.length || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.employees;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = employeesSlice.actions;
export default employeesSlice.reducer;
