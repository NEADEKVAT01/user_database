import { configureStore } from '@reduxjs/toolkit';
import listReducer from './listSlice';

/**
 * Redux store configuration
 */
export default configureStore({
  reducer: {
    list: listReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable serializable check for simplicity
    }),
  devTools: process.env.NODE_ENV === 'development' // Enable Redux DevTools in development
});