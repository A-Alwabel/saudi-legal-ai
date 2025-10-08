import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../services/unifiedApiService';

interface NotificationsState {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const notifications = await notificationsApi.getAll(params);
      return {
        notifications: notifications || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: notifications?.length || 0,
          totalPages: Math.ceil((notifications?.length || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getUnreadCount();
      return response.data.data.count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { clearError, markAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
