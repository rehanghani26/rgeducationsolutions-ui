import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import roleAccessReducer from './slices/roleAccessSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roleAccess: roleAccessReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
