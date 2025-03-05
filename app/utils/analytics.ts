import PostHog from 'posthog-react-native'
import Constants from 'expo-constants'
import * as Application from 'expo-application'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// Create PostHog instance
let posthog: PostHog | null = null

// Analytics class
class Analytics {
  static async initialize() {
    try {
      posthog = new PostHog(
        Constants.expoConfig?.extra?.EXPO_PUBLIC_POSTHOG_API_KEY || process.env.EXPO_PUBLIC_POSTHOG_API_KEY!,
        {
          host: Constants.expoConfig?.extra?.EXPO_PUBLIC_POSTHOG_HOST || process.env.EXPO_PUBLIC_POSTHOG_HOST!,
          sendFeatureFlagEvent: true,
          preloadFeatureFlags: true,
        }
      )

      // Set initial device properties
      const deviceId = await Analytics.getDeviceId()
      const deviceProps = await Analytics.getDeviceProperties()
      await posthog?.identify(deviceId, deviceProps)

      // Track initial app launch
      Analytics.trackEvent('App Launched')
    } catch (error) {
      console.error('Failed to initialize PostHog:', error)
    }
  }

  // Get unique device identifier
  private static async getDeviceId(): Promise<string> {
    try {
      if (Platform.OS === 'android') {
        return await Application.getAndroidId() || 'unknown'
      } else if (Platform.OS === 'ios') {
        return await Application.getIosIdForVendorAsync() || 'unknown'
      }
      return 'unknown'
    } catch (error) {
      console.error('Error getting device ID:', error)
      return 'unknown'
    }
  }

  // Get device properties
  private static async getDeviceProperties() {
    return {
      appVersion: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
      deviceName: Device.deviceName,
      deviceType: Device.deviceType,
      osName: Device.osName,
      osVersion: Device.osVersion,
      manufacturer: Device.manufacturer,
      brand: Device.brand,
      model: Device.modelName,
      platform: Platform.OS,
    }
  }

  static trackScreen(screenName: string, properties?: Record<string, any>) {
    posthog?.screen(screenName, {
      ...properties,
      timestamp: new Date().toISOString(),
    })
  }

  static trackEvent(eventName: string, properties?: Record<string, any>) {
    posthog?.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    })
  }

  static setUserProperties(properties: Record<string, any>) {
    posthog?.register(properties)
  }

  static trackError(error: Error, additionalProperties?: Record<string, any>) {
    posthog?.capture('Error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...additionalProperties,
      timestamp: new Date().toISOString(),
    })
  }

  static async getFeatureFlag(flagName: string) {
    return await posthog?.getFeatureFlag(flagName)
  }

  static startSession() {
    this.trackEvent('Session Started')
  }

  static endSession() {
    this.trackEvent('Session Ended')
  }

  static trackPerformance(metricName: string, durationMs: number) {
    this.trackEvent('Performance Metric', {
      metric_name: metricName,
      duration_ms: durationMs,
    })
  }

  static trackUserAction(
    actionName: string,
    category: string,
    properties?: Record<string, any>
  ) {
    this.trackEvent('User Action', {
      action: actionName,
      category,
      ...properties,
    })
  }
}

export const initializeAnalytics = Analytics.initialize
export default Analytics 