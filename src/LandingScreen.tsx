import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ReactNavigationPerformanceView } from '@shopify/react-native-performance-navigation'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { Screen } from 'src/Screen'
import { Button, Flex, Text, TouchableArea } from 'ui/src'
import { AnimatedFlex } from 'ui/src/components/layout/AnimatedFlex'
import { useEnabledChains } from 'uniswap/src/features/chains/hooks/useEnabledChains'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { setIsTestnetModeEnabled } from 'uniswap/src/features/settings/slice'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { ElementName } from 'uniswap/src/features/telemetry/constants'
import { TestID } from 'uniswap/src/test/fixtures/testIDs'
import { ImportType, OnboardingEntryPoint } from 'uniswap/src/types/onboarding'
import { OnboardingScreens } from 'uniswap/src/types/screens/mobile'
import { isE2EMode } from 'utilities/src/environment/constants'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { LANDING_ANIMATION_DURATION, LandingBackground } from 'wallet/src/components/landing/LandingBackground'

type OnboardingStackBaseParams = {
  importType: ImportType
  entryPoint: OnboardingEntryPoint
}
type OnboardingStackParamList = {
  [OnboardingScreens.Landing]: OnboardingStackBaseParams
}
type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.Landing>

export function LandingScreen({ navigation }: Props): JSX.Element {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { isTestnetModeEnabled } = useEnabledChains()
  const actionButtonsOpacity = useSharedValue(0)
  const actionButtonsStyle = useAnimatedStyle(() => ({ opacity: actionButtonsOpacity.value }), [actionButtonsOpacity])

  useEffect(() => {
    // disables looping animation during e2e tests which was preventing js thread from idle
    if (!isE2EMode) {
      actionButtonsOpacity.value = withDelay(LANDING_ANIMATION_DURATION, withTiming(1, { duration: ONE_SECOND_MS }))
    }
  }, [actionButtonsOpacity])

  // Disables testnet mode on mount if enabled (eg upon removing a wallet)
  useEffect(() => {
    if (isTestnetModeEnabled) {
      dispatch(setIsTestnetModeEnabled(false))
    }
  }, [dispatch, isTestnetModeEnabled])

  const isEmbeddedWalletEnabled = useFeatureFlag(FeatureFlags.EmbeddedWallet)

  return (
    <ReactNavigationPerformanceView interactive screenName={OnboardingScreens.Landing}>
      <Screen backgroundColor="$surface1" edges={['bottom']}>
        <Flex fill gap="$spacing8">
          <Flex shrink height="100%" width="100%">
            <LandingBackground navigationEventConsumer={navigation} />
          </Flex>
          <AnimatedFlex grow height="auto" style={actionButtonsStyle}>
            <Flex grow $short={{ gap: '$spacing16' }} gap="$spacing24" mx="$spacing16">
              <Trace logPress element={ElementName.CreateAccount}>
                <Flex centered row>
                  <Button
                    fill={false}
                    variant="branded"
                    flexShrink={1}
                    hitSlop={16}
                    shadowColor="$accent1"
                    shadowOpacity={0.4}
                    shadowRadius="$spacing8"
                    size="large"
                    testID={TestID.CreateAccount}
                  >
                    {isEmbeddedWalletEnabled
                      ? t('onboarding.landing.button.createAccount')
                      : t('onboarding.landing.button.create')}
                  </Button>
                </Flex>
              </Trace>
              <Trace logPress element={ElementName.ImportAccount}>
                <TouchableArea
                  alignItems="center"
                  hitSlop={16}
                  testID={TestID.ImportAccount}
                  onLongPress={async (): Promise<void> => {}}
                >
                  <Text
                    $short={{ variant: 'buttonLabel1', fontSize: '$medium' }}
                    color="$accent1"
                    variant="buttonLabel1"
                  >
                    {isEmbeddedWalletEnabled
                      ? t('onboarding.intro.button.signInOrImport')
                      : t('onboarding.landing.button.add')}
                  </Text>
                </TouchableArea>
              </Trace>
            </Flex>
          </AnimatedFlex>
        </Flex>
      </Screen>
    </ReactNavigationPerformanceView>
  )
}
