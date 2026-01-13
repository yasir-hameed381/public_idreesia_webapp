import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

// Reducers
import languageReducer from "./slicers/languageSlice";
import wazaifReducer from "./slicers/wazaifSlice";
import messagesReducer from "./slicers/meesagesSlice";
import searchReducer from "./slicers/searchSlice";
import tagReducer from "./slicers/tagSlice";
import categoryReducer from "./slicers/categorySlice";
import naatShirfReducer from "./slicers/naatsharifSlice";
import messagesSliceReducer from "./slicers/messagesSlice";
import taleematReducer from "./slicers/taleematSlice";
import authReducer from "./slicers/authSlice";
// API slices
import { naatsharifApi } from "./slicers/naatsharifApi";
import { taleematApi } from "./slicers/taleematApi";
import { messagesApi } from "./slicers/messagesApi";
import { wazaifApi } from "./slicers/wazaifApi";
import { tagApi } from "../store/slicers/tagsApi";
import { categoryApi } from "./slicers/categoryApi";
import { mehfilApi } from "./slicers/mehfilApi";
import { mehfilDirectoryApi } from "./slicers/mehfildirectoryApi";
import { zoneSlice } from "./slicers/zoneApi";
import { karkunApi } from "./slicers/EhadKarkunApi";
import {namazApi} from "./slicers/NamazApi"
import { karkunanApi } from "./slicers/karkunanApi";
import { newEhadApi } from "./slicers/newEhadApi";
import { parhaiyanApi } from "./slicers/parhaiyanApi";
import { mehfilReportsApi } from "./slicers/mehfilReportsApi";
import { dashboardStatsApi } from "./slicers/dashboardStatsApi";
import { karkunJoinRequestsApi } from "./slicers/karkunJoinRequestsApi";
import { feedbackApi } from "./slicers/feedbackApi";
import { adminUserApi } from "./slicers/adminUserApi";
import karkunJoinRequestsReducer from "./slicers/karkunJoinRequestsSlice";
import newEhadFollowUpsReducer from "./slicers/newEhadFollowUpsSlice";
import dutyTypesReducer from "./slicers/dutyTypesSlice";

// Persist configs
const languagePersistConfig = {
  key: "language",
  storage,
};

const mehfilPersistConfig = {
  key: "mehfil",
  storage,
};

const wazaifPersistConfig = {
  key: "wazaif",
  storage,
};

const searchPersistConfig = {
  key: "search",
  storage,
  blacklist: ['searchResults', 'isLoading', 'error'], // Don't persist search results
  timeout: 100, // Reduce rehydration time
};

const tagPersistConfig = {
  key: "tag",
  storage,
  blacklist: ['loading', 'error', 'tags'], // Don't persist tags list (fetch fresh)
  timeout: 100,
};

const categoryPersistConfig = {
  key: "category",
  storage,
  blacklist: ['loading', 'error', 'categories'], // Don't persist categories list
  timeout: 100,
};

const naatsharifPersistConfig = {
  key: "naatsharif",
  storage,
  blacklist: ['loading', 'error', 'list', 'currentPage'], // Don't persist list data
  timeout: 100,
};

const messagesSlicePersistConfig = {
  key: "messagesSlice",
  storage,
  blacklist: ['loading', 'error', 'messages', 'currentPage'], // Don't persist messages list
  timeout: 100,
};

const taleematPersistConfig = {
  key: "taleemat",
  storage,
  blacklist: ['loading', 'error', 'list', 'currentPage'], // Don't persist list data
  timeout: 100,
};

const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: ['isLoading', 'isLoggingIn', 'error'] // Don't persist loading states and errors
};

const karkunJoinRequestsPersistConfig = {
  key: "karkunJoinRequests",
  storage,
  blacklist: ['loading', 'error']
};

const newEhadFollowUpsPersistConfig = {
  key: "newEhadFollowUps",
  storage,
  blacklist: ['loading', 'error']
};

const dutyTypesPersistConfig = {
  key: "dutyTypes",
  storage,
  blacklist: ['loading', 'error']
};

// Create persisted reducers
const persistedLanguageReducer = persistReducer(languagePersistConfig, languageReducer);
const persistedWazaifReducer = persistReducer(wazaifPersistConfig, wazaifReducer);
const persistedSearchReducer = persistReducer(searchPersistConfig, searchReducer);
const persistedTagReducer = persistReducer(tagPersistConfig, tagReducer);
const persistedCategoryReducer = persistReducer(categoryPersistConfig, categoryReducer);
const naatsharifReducer = persistReducer(naatsharifPersistConfig, naatShirfReducer);
const persistedMessagesSliceReducer = persistReducer(messagesSlicePersistConfig, messagesSliceReducer);
const taleematsReducer = persistReducer(taleematPersistConfig, taleematReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedKarkunJoinRequestsReducer = persistReducer(karkunJoinRequestsPersistConfig, karkunJoinRequestsReducer);
const persistedNewEhadFollowUpsReducer = persistReducer(newEhadFollowUpsPersistConfig, newEhadFollowUpsReducer);
const persistedDutyTypesReducer = persistReducer(dutyTypesPersistConfig, dutyTypesReducer);

// Configure store with RTK Query API reducers and middleware
export const store = configureStore({
  reducer: {
    language: persistedLanguageReducer,
    wazaif: persistedWazaifReducer,
    messages: messagesReducer,
    messagesSlice: persistedMessagesSliceReducer,
    search: persistedSearchReducer,
    tag: persistedTagReducer,
    category: persistedCategoryReducer,
    naatsharif: naatsharifReducer,
    taleemat: taleematsReducer,
    auth: persistedAuthReducer,
    karkunJoinRequests: persistedKarkunJoinRequestsReducer,
    newEhadFollowUps: persistedNewEhadFollowUpsReducer,
    dutyTypes: persistedDutyTypesReducer,
    
    // API reducers
    [naatsharifApi.reducerPath]: naatsharifApi.reducer,
    [taleematApi.reducerPath]: taleematApi.reducer,
    [mehfilApi.reducerPath]: mehfilApi.reducer,
    [messagesApi.reducerPath]: messagesApi.reducer,
    [wazaifApi.reducerPath]: wazaifApi.reducer,
    [tagApi.reducerPath]: tagApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [parhaiyanApi.reducerPath]: parhaiyanApi.reducer,  
    [mehfilDirectoryApi.reducerPath]: mehfilDirectoryApi.reducer,
    [zoneSlice.reducerPath]: zoneSlice.reducer,
    [karkunApi.reducerPath]: karkunApi.reducer,
    [namazApi.reducerPath]:namazApi.reducer,

    [mehfilReportsApi.reducerPath]: mehfilReportsApi.reducer,
    [dashboardStatsApi.reducerPath]: dashboardStatsApi.reducer,
    [karkunJoinRequestsApi.reducerPath]: karkunJoinRequestsApi.reducer,
    [feedbackApi.reducerPath]: feedbackApi.reducer,
    [karkunanApi.reducerPath]: karkunanApi.reducer,
    [newEhadApi.reducerPath]: newEhadApi.reducer,
    [adminUserApi.reducerPath]: adminUserApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Optimize immutability checks in production
      immutableCheck: process.env.NODE_ENV === 'production' ? false : { warnAfter: 128 },
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'meta.arg',
          'payload.timestamp',
          'meta.baseQueryMeta',  // RTK Query stores non-serializable Request objects here
          'payload.headers',     // HTTP headers
          'payload.request',     // Fetch Request object
          'error.meta.baseQueryMeta', // Error responses from RTK Query
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'items.dates',
          // RTK Query cache paths - ignore non-serializable values in API slices
          'naatsharifApi',
          'taleematApi',
          'mehfilApi',
          'messagesApi',
          'wazaifApi',
          'tagApi',
          'categoryApi',
          'parhaiyanApi',
          'mehfilDirectoryApi',
          'zoneApi',
          'karkunApi',
          'namazApi',
          'mehfilReportsApi',
          'dashboardStatsApi',
          'karkunJoinRequestsApi',
          'feedbackApi',
          'karkunanApi',
          'newEhadApi',
          'adminUserApi',
        ],
        warnAfter: 128,
      },
    })
    .concat(naatsharifApi.middleware)
    .concat(taleematApi.middleware)
    .concat(mehfilApi.middleware)
    .concat(messagesApi.middleware)
    .concat(wazaifApi.middleware)
    .concat(tagApi.middleware)
    .concat(categoryApi.middleware)
    .concat(parhaiyanApi.middleware)  
    .concat(mehfilDirectoryApi.middleware)  
    .concat(zoneSlice.middleware)  
    .concat(karkunApi.middleware)  
    .concat(namazApi.middleware)
    .concat(mehfilReportsApi.middleware)
    .concat(dashboardStatsApi.middleware)
    .concat(karkunJoinRequestsApi.middleware)
    .concat(feedbackApi.middleware)
    .concat(karkunanApi.middleware)
    .concat(newEhadApi.middleware)
    .concat(adminUserApi.middleware),
  // Enable devTools only in development
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
