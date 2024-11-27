import { configureStore } from '@reduxjs/toolkit';
import { postApi } from '../services/postApi.ts';

const store = configureStore({
    reducer: {
        [postApi.reducerPath]: postApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(postApi.middleware),
});

export default store;
