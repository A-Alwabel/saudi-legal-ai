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
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const tasks = await tasksApi.getAll(params);
      return {
        tasks: tasks || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: tasks?.length || 0,
          totalPages: Math.ceil((tasks?.length || 0) / (params.limit || 10))
        }
      };
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
