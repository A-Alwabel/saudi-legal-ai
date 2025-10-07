import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };
  notifications: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }[];
  breadcrumbs: Array<{
    label: string;
    labelAr?: string;
    href?: string;
  }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  language: 'en',
  loading: {
    global: false,
    components: {},
  },
  modals: {},
  notifications: [],
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<'en' | 'ar'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action: PayloadAction<{ component: string; loading: boolean }>) => {
      state.loading.components[action.payload.component] = action.payload.loading;
    },
    openModal: (state, action: PayloadAction<{ modal: string; data?: any }>) => {
      state.modals[action.payload.modal] = {
        open: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].open = false;
        state.modals[action.payload].data = undefined;
      }
    },
    showNotification: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }>) => {
      state.notifications.push({
        show: true,
        ...action.payload,
      });
    },
    hideNotification: (state, action: PayloadAction<number>) => {
      if (state.notifications[action.payload]) {
        state.notifications[action.payload].show = false;
      }
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1);
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{
      label: string;
      labelAr?: string;
      href?: string;
    }>>) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action: PayloadAction<{
      label: string;
      labelAr?: string;
      href?: string;
    }>) => {
      state.breadcrumbs.push(action.payload);
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLanguage,
  setGlobalLoading,
  setComponentLoading,
  openModal,
  closeModal,
  showNotification,
  hideNotification,
  removeNotification,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
} = uiSlice.actions;

export default uiSlice.reducer;
