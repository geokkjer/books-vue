import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { User, LoginForm } from './types'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const isAuthenticated = computed(() => !!user.value && !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const canManageUsers = computed(() => isAdmin.value)
    const canManageBooks = computed(() => isAuthenticated.value)

    // Actions
    async function login(credentials: LoginForm): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // const response = await api.post<ApiResponse<{ user: User; token: string }>>('/api/auth/login', credentials)

            // Temporary mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

            // Accept any non-empty username/password for demo, with specific admin credentials
            if (credentials.username && credentials.password) {
                let mockUser: User

                if (credentials.username === 'admin' && credentials.password === 'password') {
                    mockUser = {
                        id: 1,
                        email: 'admin@books-library.local',
                        name: 'Administrator',
                        role: 'admin',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                } else {
                    // Create a regular user for any other valid credentials
                    mockUser = {
                        id: 2,
                        email: `${credentials.username}@books-library.local`,
                        name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
                        role: 'user',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                }

                const mockToken = 'mock-jwt-token-' + Date.now()

                user.value = mockUser
                token.value = mockToken

                // Store in localStorage for persistence
                if (credentials.remember) {
                    localStorage.setItem('books_auth_token', mockToken)
                    localStorage.setItem('books_auth_user', JSON.stringify(mockUser))
                } else {
                    sessionStorage.setItem('books_auth_token', mockToken)
                    sessionStorage.setItem('books_auth_user', JSON.stringify(mockUser))
                }
            } else {
                throw new Error('Invalid username or password')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Login failed'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function logout(): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // await api.post('/api/auth/logout')

            // Clear state
            user.value = null
            token.value = null

            // Clear storage
            localStorage.removeItem('books_auth_token')
            localStorage.removeItem('books_auth_user')
            sessionStorage.removeItem('books_auth_token')
            sessionStorage.removeItem('books_auth_user')
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Logout failed'
            console.error('Logout error:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function refreshToken(): Promise<void> {
        if (!token.value) return

        try {
            // TODO: Replace with actual API call to Gleam backend
            // const response = await api.post<ApiResponse<{ token: string }>>('/api/auth/refresh')
            // token.value = response.data.token

            console.log('Token refresh would happen here')
        } catch (err) {
            console.error('Token refresh failed:', err)
            await logout() // Force logout on refresh failure
        }
    }

    async function checkAuth(): Promise<void> {
        // Try to restore authentication from storage
        const storedToken = localStorage.getItem('books_auth_token') || sessionStorage.getItem('books_auth_token')
        const storedUser = localStorage.getItem('books_auth_user') || sessionStorage.getItem('books_auth_user')

        if (storedToken && storedUser) {
            try {
                token.value = storedToken
                user.value = JSON.parse(storedUser)

                // TODO: Validate token with backend
                // await api.get('/api/auth/me')

                console.log('Authentication restored from storage')
            } catch (err) {
                console.error('Stored authentication invalid:', err)
                await logout()
            }
        }
    }

    async function updateProfile(updates: Partial<User>): Promise<void> {
        if (!user.value) return

        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // const response = await api.put<ApiResponse<User>>('/api/user/profile', updates)

            // Temporary mock implementation
            user.value = { ...user.value, ...updates, updated_at: new Date().toISOString() }

            // Update storage
            const storage = localStorage.getItem('books_auth_user') ? localStorage : sessionStorage
            storage.setItem('books_auth_user', JSON.stringify(user.value))
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Profile update failed'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    function clearError(): void {
        error.value = null
    }

    // Initialize auth state on store creation
    checkAuth()

    return {
        // State
        user: readonly(user),
        token: readonly(token),
        isLoading: readonly(isLoading),
        error: readonly(error),

        // Getters
        isAuthenticated,
        isAdmin,
        canManageUsers,
        canManageBooks,

        // Actions
        login,
        logout,
        refreshToken,
        checkAuth,
        updateProfile,
        clearError
    }
})
