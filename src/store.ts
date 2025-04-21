import type { Middleware, PreloadedState } from '@reduxjs/toolkit'
import { combineReducers } from '@reduxjs/toolkit'
import { MMKV } from 'react-native-mmkv'
import { Storage, persistReducer, persistStore } from 'redux-persist'
import { fiatOnRampAggregatorApi } from 'uniswap/src/features/fiatOnRamp/api'
import { isNonJestDev } from 'utilities/src/environment/constants'
import { createDatadogReduxEnhancer } from 'utilities/src/logger/datadog/Datadog'
import { createStore } from 'wallet/src/state'
import { walletPersistedStateList, walletReducers } from 'wallet/src/state/walletReducer'

const storage = new MMKV()

const reduxStorage: Storage = {
  setItem: (key, value) => {
    storage.set(key, value)
    return Promise.resolve(true)
  },
  getItem: (key) => {
    const value = storage.getString(key)
    return Promise.resolve(value)
  },
  removeItem: (key) => {
    storage.delete(key)
    return Promise.resolve()
  },
}

export const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: walletPersistedStateList,
}

const mobileReducer = combineReducers(walletReducers)
type MobileState = ReturnType<typeof mobileReducer>
const persistedReducer = persistReducer(persistConfig, mobileReducer)

const dataDogReduxEnhancer = createDatadogReduxEnhancer({
  shouldLogReduxState: (state: MobileState): boolean => {
    // Do not log the state if a user has opted out of analytics.
    return !!state.telemetry.allowAnalytics
  },
})

const enhancers = [dataDogReduxEnhancer]

if (isNonJestDev) {
  const reactotron = require('src/../ReactotronConfig').default
  enhancers.push(reactotron.createEnhancer())
}

const middlewares: Middleware[] = [fiatOnRampAggregatorApi.middleware]

const setupStore = (
  preloadedState?: PreloadedState<MobileState>,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return createStore({
    reducer: persistedReducer,
    preloadedState,
    additionalSagas: [],
    middlewareAfter: [...middlewares],
    enhancers,
  })
}
export const store = setupStore()

export const persistor = persistStore(store)
