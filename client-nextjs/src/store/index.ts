import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import casesSlice from './slices/casesSlice';
import clientsSlice from './slices/clientsSlice';
import documentsSlice from './slices/documentsSlice';
import tasksSlice from './slices/tasksSlice';
import appointmentsSlice from './slices/appointmentsSlice';
import invoicesSlice from './slices/invoicesSlice';
import employeesSlice from './slices/employeesSlice';
import notificationsSlice from './slices/notificationsSlice';
import legalLibrarySlice from './slices/legalLibrarySlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    cases: casesSlice,
    clients: clientsSlice,
    documents: documentsSlice,
    tasks: tasksSlice,
    appointments: appointmentsSlice,
    invoices: invoicesSlice,
    employees: employeesSlice,
    notifications: notificationsSlice,
    legalLibrary: legalLibrarySlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;