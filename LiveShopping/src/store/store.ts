import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {}, // aucun slice pour l'instant
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;