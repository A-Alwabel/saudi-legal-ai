import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { legalLibraryApi } from '../../services/unifiedApiService';

interface LegalLibraryState {
  resources: any[];
  currentResource: any | null;
  searchResults: any[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: LegalLibraryState = {
  resources: [],
  currentResource: null,
  searchResults: [],
  isLoading: false,
  isSearching: false,
  error: null,
  pagination: null,
};

export const fetchResources = createAsyncThunk(
  'legalLibrary/fetchResources',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const resources = await legalLibraryApi.getAll(params);
      return {
        resources: resources || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: resources?.length || 0,
          totalPages: Math.ceil((resources?.length || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resources');
    }
  }
);

export const searchResources = createAsyncThunk(
  'legalLibrary/searchResources',
  async ({ query, filters }: { query: string; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await legalLibraryApi.searchResources(query, filters);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search resources');
    }
  }
);

const legalLibrarySlice = createSlice({
  name: 'legalLibrary',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSearchResults: (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload.resources;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(searchResources.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchResources.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchResources.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSearchResults } = legalLibrarySlice.actions;
export default legalLibrarySlice.reducer;
