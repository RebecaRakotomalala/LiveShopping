import { configureStore } from '@reduxjs/toolkit';
import userReducer from './../store/slices/userSlice';
// import itemReducer from '@/store/slices/itemSlice';
// import bagReducer from '@/store/slices/bagSlice';
// import notificationReducer from '@/store/slices/notificationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    // item: itemReducer,
    // bag: bagReducer,
    // notification: notificationReducer,
  },
});

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
