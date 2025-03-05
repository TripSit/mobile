import { useCallback } from 'react'
import Analytics from '../utils/analytics'

export const useAnalytics = () => {
  const logEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    Analytics.trackEvent(eventName, properties)
  }, [])

  const logScreen = useCallback((screenName: string, properties?: Record<string, any>) => {
    Analytics.trackScreen(screenName, properties)
  }, [])

  const logError = useCallback((error: Error, properties?: Record<string, any>) => {
    Analytics.trackError(error, properties)
  }, [])

  const logAction = useCallback((actionName: string, category: string, properties?: Record<string, any>) => {
    Analytics.trackUserAction(actionName, category, properties)
  }, [])

  const logPerformance = useCallback((metricName: string, durationMs: number) => {
    Analytics.trackPerformance(metricName, durationMs)
  }, [])

  return {
    logEvent,
    logScreen,
    logError,
    logAction,
    logPerformance,
  }
} 