// Custom hooks untuk notification system

import { useCallback } from 'react'
import { useAppStore } from '@/lib/store/app-store'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// Hook untuk notification management
export function useNotifications() {
  const { ui, addNotification, removeNotification } = useAppStore()

  // Show notification
  const showNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    }

    addNotification(notification)

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [addNotification, removeNotification])

  // Convenience methods for different notification types
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('success', title, message, duration)
  }, [showNotification])

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('error', title, message, duration || 8000) // Errors stay longer
  }, [showNotification])

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('warning', title, message, duration)
  }, [showNotification])

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('info', title, message, duration)
  }, [showNotification])

  // Remove specific notification
  const dismissNotification = useCallback((id: string) => {
    removeNotification(id)
  }, [removeNotification])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    ui.notifications.forEach(notification => {
      removeNotification(notification.id)
    })
  }, [ui.notifications, removeNotification])

  return {
    notifications: ui.notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    clearAllNotifications
  }
}

// Hook untuk UI state management
export function useUI() {
  const {
    ui,
    setTheme,
    setActiveTab,
    setLoading,
    setSidebarOpen
  } = useAppStore()

  // Theme management
  const toggleTheme = useCallback(() => {
    const newTheme = ui.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [ui.theme, setTheme])

  const setLightTheme = useCallback(() => {
    setTheme('light')
  }, [setTheme])

  const setDarkTheme = useCallback(() => {
    setTheme('dark')
  }, [setTheme])

  const setSystemTheme = useCallback(() => {
    setTheme('system')
  }, [setTheme])

  // Tab management
  const switchTab = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  // Loading state management
  const showLoading = useCallback(() => {
    setLoading(true)
  }, [setLoading])

  const hideLoading = useCallback(() => {
    setLoading(false)
  }, [setLoading])

  // Sidebar management
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!ui.sidebarOpen)
  }, [ui.sidebarOpen, setSidebarOpen])

  const openSidebar = useCallback(() => {
    setSidebarOpen(true)
  }, [setSidebarOpen])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [setSidebarOpen])

  return {
    // State
    theme: ui.theme,
    activeTab: ui.activeTab,
    isLoading: ui.isLoading,
    sidebarOpen: ui.sidebarOpen,

    // Theme actions
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    setTheme,

    // Tab actions
    switchTab,
    setActiveTab,

    // Loading actions
    showLoading,
    hideLoading,
    setLoading,

    // Sidebar actions
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setSidebarOpen
  }
}