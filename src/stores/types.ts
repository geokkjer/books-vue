// Pinia Store Type Definitions
// Common types used across multiple stores

export interface User {
    id: number
    email: string
    name: string
    role: 'admin' | 'user'
    created_at: string
    updated_at: string
}

export interface Book {
    id: number
    user_id: number
    title: string
    author: string
    isbn?: string
    genre?: string
    status: 'to_read' | 'reading' | 'completed'
    rating?: number
    notes?: string
    cover_image?: string
    reading_progress?: number
    started_at?: string
    completed_at?: string
    created_at: string
    updated_at: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

export interface LibraryState {
    books: Book[]
    isLoading: boolean
    error: string | null
    searchQuery: string
    filters: {
        status: Book['status'] | 'all'
        genre: string | 'all'
        rating: number | null
    }
    sortBy: 'title' | 'author' | 'created_at' | 'rating'
    sortOrder: 'asc' | 'desc'
    currentPage: number
    itemsPerPage: number
}

export interface UIState {
    isDarkMode: boolean
    isMobileMenuOpen: boolean
    isLoading: boolean
    notifications: Notification[]
    modals: {
        addBook: boolean
        editBook: boolean
        deleteConfirm: boolean
        userSettings: boolean
    }
}

export interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
    persistent?: boolean
    created_at: number
}

export interface AdminState {
    users: User[]
    systemSettings: SystemSettings
    auditLogs: AuditLog[]
    isLoading: boolean
    error: string | null
    stats: {
        totalUsers: number
        totalBooks: number
        activeUsers: number
        recentActivity: number
    }
}

export interface SystemSettings {
    app_name: string
    app_description: string
    allow_registration: boolean
    require_email_verification: boolean
    max_books_per_user: number
    backup_frequency: 'daily' | 'weekly' | 'monthly'
    theme_mode: 'light' | 'dark' | 'system'
}

export interface AuditLog {
    id: number
    user_id: number
    action: string
    resource_type: 'user' | 'book' | 'system'
    resource_id?: number
    details: Record<string, unknown>
    ip_address: string
    user_agent: string
    created_at: string
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: string
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
        hasNext: boolean
        hasPrevious: boolean
    }
}

// Form and Validation Types
export interface LoginForm {
    email: string
    password: string
    remember: boolean
}

export interface CreateBookForm {
    title: string
    author: string
    isbn?: string
    genre?: string
    status: Book['status']
    notes?: string
}

export interface UpdateBookForm extends Partial<CreateBookForm> {
    rating?: number
    reading_progress?: number
}

export interface CreateUserForm {
    name: string
    email: string
    password: string
    role: User['role']
}

export interface UpdateUserForm {
    name?: string
    email?: string
    role?: User['role']
}

// Store Action Types
export type AuthActions = {
    login: (credentials: LoginForm) => Promise<void>
    logout: () => Promise<void>
    refreshToken: () => Promise<void>
    checkAuth: () => Promise<void>
    updateProfile: (updates: Partial<User>) => Promise<void>
}

export type LibraryActions = {
    fetchBooks: () => Promise<void>
    createBook: (book: CreateBookForm) => Promise<void>
    updateBook: (id: number, updates: UpdateBookForm) => Promise<void>
    deleteBook: (id: number) => Promise<void>
    searchBooks: (query: string) => void
    setFilter: (key: keyof LibraryState['filters'], value: string | number | null) => void
    setSorting: (sortBy: LibraryState['sortBy'], order: LibraryState['sortOrder']) => void
    setPage: (page: number) => void
}

export type UIActions = {
    toggleDarkMode: () => void
    toggleMobileMenu: () => void
    showNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
    dismissNotification: (id: string) => void
    openModal: (modal: keyof UIState['modals']) => void
    closeModal: (modal: keyof UIState['modals']) => void
    setLoading: (loading: boolean) => void
}

export type AdminActions = {
    fetchUsers: () => Promise<void>
    createUser: (user: CreateUserForm) => Promise<void>
    updateUser: (id: number, updates: UpdateUserForm) => Promise<void>
    deleteUser: (id: number) => Promise<void>
    fetchSystemSettings: () => Promise<void>
    updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>
    fetchAuditLogs: () => Promise<void>
    fetchStats: () => Promise<void>
}
