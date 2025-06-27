import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type {
    AdminState,
    User,
    SystemSettings,
    AuditLog,
    CreateUserForm,
    UpdateUserForm,
    AdminActions
} from './types'

export const useAdminStore = defineStore('admin', () => {
    // Reactive state
    const state = reactive<AdminState>({
        users: [],
        systemSettings: getDefaultSystemSettings(),
        auditLogs: [],
        isLoading: false,
        error: null,
        stats: {
            totalUsers: 0,
            totalBooks: 0,
            activeUsers: 0,
            recentActivity: 0,
        },
    })

    // Computed getters
    const totalUsers = computed(() => state.users.length)
    const adminUsers = computed(() => state.users.filter(user => user.role === 'admin'))
    const regularUsers = computed(() => state.users.filter(user => user.role === 'user'))
    const recentUsers = computed(() => {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return state.users.filter(user => new Date(user.created_at) > oneWeekAgo)
    })
    const recentAuditLogs = computed(() => state.auditLogs.slice(0, 10))
    const hasError = computed(() => state.error !== null)

    // Actions
    const fetchUsers: AdminActions['fetchUsers'] = async () => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call - replace with real API when backend is implemented
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Mock user data
            state.users = [
                {
                    id: 1,
                    email: 'admin@example.com',
                    name: 'System Administrator',
                    role: 'admin',
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2025-01-15T12:00:00Z',
                },
                {
                    id: 2,
                    email: 'john@example.com',
                    name: 'John Doe',
                    role: 'user',
                    created_at: '2025-01-10T08:30:00Z',
                    updated_at: '2025-01-20T15:45:00Z',
                },
                {
                    id: 3,
                    email: 'jane@example.com',
                    name: 'Jane Smith',
                    role: 'user',
                    created_at: '2025-01-15T14:20:00Z',
                    updated_at: '2025-01-22T09:10:00Z',
                },
            ]

            updateStats()
        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to fetch users'
            console.error('Error fetching users:', error)
        } finally {
            state.isLoading = false
        }
    }

    const createUser: AdminActions['createUser'] = async (userData: CreateUserForm) => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 800))

            const newUser: User = {
                id: Math.max(...state.users.map(u => u.id), 0) + 1,
                ...userData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            state.users.push(newUser)
            updateStats()

            // Add audit log
            addAuditLog('user_created', 'user', newUser.id, {
                user_name: newUser.name,
                user_email: newUser.email,
                user_role: newUser.role,
            })

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to create user'
            console.error('Error creating user:', error)
            throw error
        } finally {
            state.isLoading = false
        }
    }

    const updateUser: AdminActions['updateUser'] = async (id: number, updates: UpdateUserForm) => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 600))

            const userIndex = state.users.findIndex(user => user.id === id)
            if (userIndex === -1) {
                throw new Error('User not found')
            }

            const oldUser = { ...state.users[userIndex] }
            state.users[userIndex] = {
                ...state.users[userIndex],
                ...updates,
                updated_at: new Date().toISOString(),
            }

            // Add audit log
            addAuditLog('user_updated', 'user', id, {
                old_values: oldUser,
                new_values: updates,
            })

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to update user'
            console.error('Error updating user:', error)
            throw error
        } finally {
            state.isLoading = false
        }
    }

    const deleteUser: AdminActions['deleteUser'] = async (id) => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500))

            const userIndex = state.users.findIndex(user => user.id === id)
            if (userIndex === -1) {
                throw new Error('User not found')
            }

            const deletedUser = state.users[userIndex]
            state.users.splice(userIndex, 1)
            updateStats()

            // Add audit log
            addAuditLog('user_deleted', 'user', id, {
                deleted_user: deletedUser,
            })

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to delete user'
            console.error('Error deleting user:', error)
            throw error
        } finally {
            state.isLoading = false
        }
    }

    const fetchSystemSettings: AdminActions['fetchSystemSettings'] = async () => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500))

            // In real implementation, this would fetch from backend
            // For now, keep existing settings or use defaults
            if (!state.systemSettings.app_name) {
                state.systemSettings = getDefaultSystemSettings()
            }

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to fetch system settings'
            console.error('Error fetching system settings:', error)
        } finally {
            state.isLoading = false
        }
    }

    const updateSystemSettings: AdminActions['updateSystemSettings'] = async (settings) => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 700))

            const oldSettings = { ...state.systemSettings }
            state.systemSettings = {
                ...state.systemSettings,
                ...settings,
            }

            // Add audit log
            addAuditLog('system_settings_updated', 'system', undefined, {
                old_settings: oldSettings,
                new_settings: settings,
            })

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to update system settings'
            console.error('Error updating system settings:', error)
            throw error
        } finally {
            state.isLoading = false
        }
    }

    const fetchAuditLogs: AdminActions['fetchAuditLogs'] = async () => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 600))

            // Audit logs are already managed internally for now
            // In real implementation, this would fetch from backend

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to fetch audit logs'
            console.error('Error fetching audit logs:', error)
        } finally {
            state.isLoading = false
        }
    }

    const fetchStats: AdminActions['fetchStats'] = async () => {
        state.isLoading = true
        state.error = null

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 400))

            updateStats()

        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to fetch statistics'
            console.error('Error fetching statistics:', error)
        } finally {
            state.isLoading = false
        }
    }

    // Utility functions
    const updateStats = () => {
        state.stats.totalUsers = state.users.length
        state.stats.activeUsers = state.users.length // Simplified for mock
        state.stats.totalBooks = 0 // Will be populated when connected to library store
        state.stats.recentActivity = state.auditLogs.length
    }

    const addAuditLog = (
        action: string,
        resourceType: AuditLog['resource_type'],
        resourceId?: number,
        details: Record<string, unknown> = {}
    ) => {
        const auditLog: AuditLog = {
            id: state.auditLogs.length + 1,
            user_id: 1, // Mock admin user ID
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            details,
            ip_address: '127.0.0.1', // Mock IP
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString(),
        }

        state.auditLogs.unshift(auditLog) // Add to beginning

        // Keep only last 100 audit logs in memory
        if (state.auditLogs.length > 100) {
            state.auditLogs = state.auditLogs.slice(0, 100)
        }
    }

    const clearError = () => {
        state.error = null
    }

    const getUserById = (id: number) => {
        return state.users.find(user => user.id === id)
    }

    const getUserByEmail = (email: string) => {
        return state.users.find(user => user.email === email)
    }

    // Initialize with some mock audit logs
    const initializeMockData = () => {
        addAuditLog('system_startup', 'system', undefined, { timestamp: new Date().toISOString() })
    }

    // Call initialization
    initializeMockData()

    return {
        // State
        ...state,

        // Getters
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
        recentAuditLogs,
        hasError,

        // Actions
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        fetchSystemSettings,
        updateSystemSettings,
        fetchAuditLogs,
        fetchStats,

        // Utility actions
        clearError,
        getUserById,
        getUserByEmail,
    }
})

// Helper function to get default system settings
function getDefaultSystemSettings(): SystemSettings {
    return {
        app_name: 'Books Library',
        app_description: 'A self-hosted personal books library management system',
        allow_registration: false,
        require_email_verification: false,
        max_books_per_user: 1000,
        backup_frequency: 'weekly',
        theme_mode: 'system',
    }
}
