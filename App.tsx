/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  MobileScreens,
  OnboardingScreens,
} from 'uniswap/src/types/screens/mobile';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {NavigationContainer as NativeNavigationContainer} from '@react-navigation/native';
import {createNavigationContainerRef} from '@react-navigation/native';
import {DevSettings} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LandingScreen} from 'src/LandingScreen';
import {ImportType, OnboardingEntryPoint} from 'uniswap/src/types/onboarding';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from 'src/store';
import {TamaguiProvider} from 'wallet/src/providers/tamagui-provider';
import {Provider as ReduxProvider} from 'react-redux';
import {I18nextProvider} from 'react-i18next';
import i18n from 'uniswap/src/i18n';
import {StatsigProviderWrapper} from 'uniswap/src/features/gating/StatsigProviderWrapper';
import {MMKV} from 'react-native-mmkv';
import {StatsigUser, Storage} from 'uniswap/src/features/gating/sdk/statsig';
import {
  default as React,
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {useAsyncData} from 'utilities/src/react/hooks';
import {DdSdkReactNative} from '@datadog/mobile-react-native';
import {MobileUserPropertyName} from 'uniswap/src/features/telemetry/user';
import {getUniqueId} from 'utilities/src/device/getUniqueId';
import {StatsigCustomAppValue} from 'uniswap/src/features/gating/constants';
import {getDynamicConfigValue} from 'uniswap/src/features/gating/hooks';
import {
  DatadogSessionSampleRateKey,
  DatadogSessionSampleRateValType,
  DynamicConfigs,
} from 'uniswap/src/features/gating/configs';

async function setDatadogUserWithUniqueId(
  activeAddress: Maybe<Address>,
): Promise<string> {
  const uniqueId = await getUniqueId();
  DdSdkReactNative.setUser({
    id: uniqueId,
    ...(activeAddress
      ? {[MobileUserPropertyName.ActiveWalletAddress]: activeAddress}
      : {}),
  }).catch(() => undefined);
  return uniqueId;
}

// In case Statsig is not available
const MOBILE_DEFAULT_DATADOG_SESSION_SAMPLE_RATE = 10; // percent

type AppStackParamList = {
  [MobileScreens.Storybook]: undefined;
};
type OnboardingStackBaseParams = {
  importType: ImportType;
  entryPoint: OnboardingEntryPoint;
};
type OnboardingStackParamList = {
  [OnboardingScreens.Landing]: OnboardingStackBaseParams;
};

const mmkv = new MMKV();

const statsigMMKVStorageProvider = {
  isReady: (): boolean => true,
  isReadyResolver: (): null => null,
  getProviderName: (): string => 'MMKV',
  getAllKeys: (): string[] => mmkv.getAllKeys(),
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkv.set(key, value),
  removeItem: (key: string): void => mmkv.delete(key),
};

const AppStack = createNativeStackNavigator<AppStackParamList>();
const navNativeStackOptions: Record<string, NativeStackNavigationOptions> = {
  noHeader: {headerShown: false},
  presentationModal: {presentation: 'modal'},
  presentationBottomSheet: {
    presentation: 'containedTransparentModal',
    animation: 'none',
    animationDuration: 0,
    contentStyle: {backgroundColor: 'transparent'},
  },
  independentBsm: {
    fullScreenGestureEnabled: true,
    gestureEnabled: true,
    headerShown: false,
    animation: 'slide_from_right',
  },
};
// this was moved to its own file to avoid circular dependencies
const navigationRef = createNavigationContainerRef();
const useAppStackNavigation = (): any => useNavigation<any>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

function AppStackNavigator(): React.JSX.Element {
  const navigation = useAppStackNavigation();

  useEffect(() => {
    // Adds a menu item to navigate to Storybook in debug builds
    if (__DEV__) {
      DevSettings.addMenuItem('Toggle Storybook', () => {
        if (navigationRef.getCurrentRoute()?.name === MobileScreens.Storybook) {
          navigation.goBack();
        } else {
          navigation.navigate(MobileScreens.Storybook);
        }
      });
    }
  }, [navigation]);

  return (
    <AppStack.Navigator
      screenOptions={{
        ...navNativeStackOptions.noHeader,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}>
      <OnboardingStack.Screen
        component={LandingScreen}
        name={OnboardingScreens.Landing}
        options={navNativeStackOptions.noHeader}
      />
      {__DEV__ &&
        ((): JSX.Element => {
          const StorybookUIRoot = require('src/../.storybook').default;
          return (
            <AppStack.Screen
              component={StorybookUIRoot}
              name={MobileScreens.Storybook}
            />
          );
        })()}
    </AppStack.Navigator>
  );
}

function App(): React.JSX.Element {
  // We want to ensure deviceID is used as the identifier to link with analytics
  const fetchAndSetDeviceId = useCallback(async (): Promise<string> => {
    return setDatadogUserWithUniqueId(undefined);
  }, []);

  const deviceId = useAsyncData(fetchAndSetDeviceId).data;

  const [datadogSessionSampleRate, setDatadogSessionSampleRate] =
    React.useState<number | undefined>(undefined);

  Storage._setProvider(statsigMMKVStorageProvider);

  const statsigUser: StatsigUser = useMemo(
    () => ({
      ...(deviceId ? {userID: deviceId} : {}),
      custom: {
        app: StatsigCustomAppValue.Mobile,
      },
    }),
    [deviceId],
  );

  const onStatsigInit = (): void => {
    setDatadogSessionSampleRate(
      getDynamicConfigValue<
        DynamicConfigs.DatadogSessionSampleRate,
        DatadogSessionSampleRateKey,
        DatadogSessionSampleRateValType
      >(
        DynamicConfigs.DatadogSessionSampleRate,
        DatadogSessionSampleRateKey.Rate,
        MOBILE_DEFAULT_DATADOG_SESSION_SAMPLE_RATE,
      ),
    );
  };

  return (
    <StatsigProviderWrapper
      user={statsigUser}
      storageProvider={statsigMMKVStorageProvider}
      onInit={onStatsigInit}>
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <SafeAreaProvider>
            <ReduxProvider store={store}>
              <TamaguiProvider>
                <NativeNavigationContainer ref={navigationRef}>
                  <AppStackNavigator />
                </NativeNavigationContainer>
              </TamaguiProvider>
            </ReduxProvider>
          </SafeAreaProvider>
        </I18nextProvider>
      </StrictMode>
    </StatsigProviderWrapper>
  );
}

export default App;
