import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { UIState, Notification, UIActions } from './types'

export const useUIStore = defineStore('ui', () => {
    // Reactive state
    const state = reactive<UIState>({
        isDarkMode: getInitialDarkMode(),
        isMobileMenuOpen: false,
        isLoading: false,
        notifications: [],
        modals: {
            addBook: false,
            editBook: false,
            deleteConfirm: false,
            userSettings: false,
        },
    })

    // Computed getters
    const hasNotifications = computed(() => state.notifications.length > 0)
    const persistentNotifications = computed(() =>
        state.notifications.filter(n => n.persistent)
    )
    const temporaryNotifications = computed(() =>
        state.notifications.filter(n => !n.persistent)
    )
    const isAnyModalOpen = computed(() =>
        Object.values(state.modals).some(isOpen => isOpen)
    )

    // Actions
    const toggleDarkMode: UIActions['toggleDarkMode'] = () => {
        state.isDarkMode = !state.isDarkMode
        // Persist to localStorage
        localStorage.setItem('books-library-dark-mode', JSON.stringify(state.isDarkMode))
        // Apply to document class for Tailwind dark mode
        if (state.isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const toggleMobileMenu: UIActions['toggleMobileMenu'] = () => {
        state.isMobileMenuOpen = !state.isMobileMenuOpen
    }

    const showNotification: UIActions['showNotification'] = (notification) => {
        const newNotification: Notification = {
            ...notification,
            id: generateNotificationId(),
            created_at: Date.now(),
        }

        state.notifications.push(newNotification)

        // Auto-dismiss non-persistent notifications
        if (!newNotification.persistent) {
            const duration = newNotification.duration || 5000
            setTimeout(() => {
                dismissNotification(newNotification.id)
            }, duration)
        }
    }

    const dismissNotification: UIActions['dismissNotification'] = (id) => {
        const index = state.notifications.findIndex(n => n.id === id)
        if (index > -1) {
            state.notifications.splice(index, 1)
        }
    }

    const openModal: UIActions['openModal'] = (modal) => {
        // Close all modals first, then open the requested one
        Object.keys(state.modals).forEach(key => {
            state.modals[key as keyof UIState['modals']] = false
        })
        state.modals[modal] = true
    }

    const closeModal: UIActions['closeModal'] = (modal) => {
        state.modals[modal] = false
    }

    const closeAllModals = () => {
        Object.keys(state.modals).forEach(key => {
            state.modals[key as keyof UIState['modals']] = false
        })
    }

    const setLoading: UIActions['setLoading'] = (loading) => {
        state.isLoading = loading
    }

    // Utility functions for notifications
    const showSuccess = (title: string, message: string, options?: Partial<Notification>) => {
        showNotification({
            type: 'success',
            title,
            message,
            ...options,
        })
    }

    const showError = (title: string, message: string, options?: Partial<Notification>) => {
        showNotification({
            type: 'error',
            title,
            message,
            persistent: true, // Error notifications should be persistent by default
            ...options,
        })
    }

    const showWarning = (title: string, message: string, options?: Partial<Notification>) => {
        showNotification({
            type: 'warning',
            title,
            message,
            ...options,
        })
    }

    const showInfo = (title: string, message: string, options?: Partial<Notification>) => {
        showNotification({
            type: 'info',
            title,
            message,
            ...options,
        })
    }

    const clearAllNotifications = () => {
        state.notifications.length = 0
    }

    const clearTemporaryNotifications = () => {
        state.notifications = state.notifications.filter(n => n.persistent)
    }

    // Initialize dark mode on store creation
    const initializeDarkMode = () => {
        if (state.isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    // Call initialization
    initializeDarkMode()

    return {
        // State
        ...state,

        // Getters
        hasNotifications,
        persistentNotifications,
        temporaryNotifications,
        isAnyModalOpen,

        // Actions
        toggleDarkMode,
        toggleMobileMenu,
        showNotification,
        dismissNotification,
        openModal,
        closeModal,
        closeAllModals,
        setLoading,

        // Utility actions
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAllNotifications,
        clearTemporaryNotifications,
    }
})

// Helper functions
function getInitialDarkMode(): boolean {
    // Check localStorage first
    const stored = localStorage.getItem('books-library-dark-mode')
    if (stored !== null) {
        return JSON.parse(stored)
    }

    // Fallback to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function generateNotificationId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
