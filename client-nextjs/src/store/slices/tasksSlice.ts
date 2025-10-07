import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksApi } from '../../services/unifiedApiService';

interface TasksState {
  tasks: any[];
  currentTask: any | null;
  isLoading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  pagination: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getTasks(params);
      return { tasks: response.data.data, pagination: response.data.pagination };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = tasksSlice.actions;
export default tasksSlice.reducer;
