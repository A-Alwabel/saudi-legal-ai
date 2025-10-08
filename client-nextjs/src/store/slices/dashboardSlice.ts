import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyticsApi } from '../../services/unifiedApiService';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingAppointments: number;
  todayAppointments: number;
  totalDocuments: number;
  recentDocuments: number;
  totalEmployees: number;
  activeEmployees: number;
}

interface RecentActivity {
  id: string;
  type: 'case' | 'client' | 'document' | 'task' | 'appointment' | 'invoice' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  caseStatusChart: ChartData | null;
  revenueChart: ChartData | null;
  taskProgressChart: ChartData | null;
  clientTypeChart: ChartData | null;
  monthlyGrowthChart: ChartData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  caseStatusChart: null,
  revenueChart: null,
  taskProgressChart: null,
  clientTypeChart: null,
  monthlyGrowthChart: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await analyticsApi.getDashboardStats();
      return data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchCaseAnalytics = createAsyncThunk(
  'dashboard/fetchCaseAnalytics',
  async (period: string = 'month', { rejectWithValue }) => {
    try {
      const data = await analyticsApi.getCaseAnalytics(period);
      return data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch case analytics');
    }
  }
);

export const fetchFinancialAnalytics = createAsyncThunk(
  'dashboard/fetchFinancialAnalytics',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const data = await analyticsApi.getFinancialAnalytics(startDate, endDate);
      return data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial analytics');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addRecentActivity: (state, action: PayloadAction<RecentActivity>) => {
      state.recentActivity.unshift(action.payload);
      // Keep only the last 20 activities
      if (state.recentActivity.length > 20) {
        state.recentActivity = state.recentActivity.slice(0, 20);
      }
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    refreshData: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentActivity = action.payload.recentActivity || [];
        state.caseStatusChart = action.payload.charts?.caseStatus || null;
        state.revenueChart = action.payload.charts?.revenue || null;
        state.taskProgressChart = action.payload.charts?.taskProgress || null;
        state.clientTypeChart = action.payload.charts?.clientType || null;
        state.monthlyGrowthChart = action.payload.charts?.monthlyGrowth || null;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch case analytics
    builder
      .addCase(fetchCaseAnalytics.fulfilled, (state, action) => {
        state.caseStatusChart = action.payload.caseStatusChart || null;
      });

    // Fetch financial analytics
    builder
      .addCase(fetchFinancialAnalytics.fulfilled, (state, action) => {
        state.revenueChart = action.payload.revenueChart || null;
        state.monthlyGrowthChart = action.payload.monthlyGrowthChart || null;
      });
  },
});

export const { clearError, addRecentActivity, updateStats, refreshData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
