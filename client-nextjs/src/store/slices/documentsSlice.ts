import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentsApi } from '../../services/unifiedApiService';

interface DocumentsState {
  documents: any[];
  currentDocument: any | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  isUploading: false,
  error: null,
  pagination: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      // Use fetch API to get documents
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/documents${query ? '?' + query : ''}`);
      const documents = await response.json();
      return {
        documents: documents || [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: documents?.length || 0,
          totalPages: Math.ceil((documents?.length || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch documents');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, metadata }: { file: File; metadata?: any }, { rejectWithValue }) => {
    try {
      const response = await documentsApi.upload(file, metadata);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload document');
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.documents;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = documentsSlice.actions;
export default documentsSlice.reducer;
