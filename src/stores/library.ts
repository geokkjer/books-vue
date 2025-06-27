import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Book, CreateBookForm, UpdateBookForm } from './types'

export const useLibraryStore = defineStore('library', () => {
    // State
    const books = ref<Book[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const searchQuery = ref('')
    const filters = ref({
        status: 'all' as Book['status'] | 'all',
        genre: 'all',
        rating: null as number | null
    })
    const sortBy = ref<'title' | 'author' | 'created_at' | 'rating'>('created_at')
    const sortOrder = ref<'asc' | 'desc'>('desc')
    const currentPage = ref(1)
    const itemsPerPage = ref(12)

    // Mock data for development
    const mockBooks: Book[] = [
        {
            id: 1,
            user_id: 1,
            title: 'The TypeScript Handbook',
            author: 'Microsoft',
            isbn: '978-1234567890',
            genre: 'Programming',
            status: 'reading',
            rating: 5,
            notes: 'Great resource for learning TypeScript',
            reading_progress: 65,
            started_at: '2024-01-15T00:00:00Z',
            created_at: '2024-01-10T00:00:00Z',
            updated_at: '2024-01-20T00:00:00Z'
        },
        {
            id: 2,
            user_id: 1,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '978-0132350884',
            genre: 'Software Engineering',
            status: 'completed',
            rating: 4,
            notes: 'Essential reading for developers',
            reading_progress: 100,
            started_at: '2023-12-01T00:00:00Z',
            completed_at: '2023-12-28T00:00:00Z',
            created_at: '2023-11-30T00:00:00Z',
            updated_at: '2023-12-28T00:00:00Z'
        },
        {
            id: 3,
            user_id: 1,
            title: 'Vue.js 3 Complete Guide',
            author: 'Maximilian Schwarzmüller',
            genre: 'Web Development',
            status: 'to_read',
            created_at: '2024-01-25T00:00:00Z',
            updated_at: '2024-01-25T00:00:00Z'
        }
    ]

    // Getters
    const filteredBooks = computed(() => {
        let result = books.value

        // Apply search filter
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.genre?.toLowerCase().includes(query)
            )
        }

        // Apply status filter
        if (filters.value.status !== 'all') {
            result = result.filter(book => book.status === filters.value.status)
        }

        // Apply genre filter
        if (filters.value.genre !== 'all') {
            result = result.filter(book => book.genre === filters.value.genre)
        }

        // Apply rating filter
        if (filters.value.rating !== null) {
            result = result.filter(book => book.rating && book.rating >= filters.value.rating!)
        }

        // Apply sorting
        result.sort((a, b) => {
            let aVal: string | number | undefined
            let bVal: string | number | undefined

            switch (sortBy.value) {
                case 'title':
                    aVal = a.title.toLowerCase()
                    bVal = b.title.toLowerCase()
                    break
                case 'author':
                    aVal = a.author.toLowerCase()
                    bVal = b.author.toLowerCase()
                    break
                case 'created_at':
                    aVal = new Date(a.created_at).getTime()
                    bVal = new Date(b.created_at).getTime()
                    break
                case 'rating':
                    aVal = a.rating || 0
                    bVal = b.rating || 0
                    break
            }

            if (aVal === undefined) return 1
            if (bVal === undefined) return -1

            if (sortOrder.value === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
            }
        })

        return result
    })

    const paginatedBooks = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredBooks.value.slice(start, end)
    })

    const totalPages = computed(() =>
        Math.ceil(filteredBooks.value.length / itemsPerPage.value)
    )

    const booksByStatus = computed(() => ({
        to_read: books.value.filter(book => book.status === 'to_read').length,
        reading: books.value.filter(book => book.status === 'reading').length,
        completed: books.value.filter(book => book.status === 'completed').length
    }))

    const averageRating = computed(() => {
        const ratedBooks = books.value.filter(book => book.rating)
        if (ratedBooks.length === 0) return 0
        const sum = ratedBooks.reduce((acc, book) => acc + (book.rating || 0), 0)
        return Math.round((sum / ratedBooks.length) * 10) / 10
    })

    const genres = computed(() => {
        const genreSet = new Set(books.value.map(book => book.genre).filter(Boolean))
        return Array.from(genreSet).sort()
    })

    // Actions
    async function fetchBooks(): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // const response = await api.get<ApiResponse<Book[]>>('/api/books')
            // books.value = response.data

            // Temporary mock implementation
            await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
            books.value = [...mockBooks]
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch books'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createBook(bookData: CreateBookForm): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // const response = await api.post<ApiResponse<Book>>('/api/books', bookData)
            // books.value.push(response.data)

            // Temporary mock implementation
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

            const newBook: Book = {
                id: Math.max(...books.value.map(b => b.id), 0) + 1,
                user_id: 1, // TODO: Get from auth store
                ...bookData,
                reading_progress: bookData.status === 'completed' ? 100 : 0,
                started_at: bookData.status !== 'to_read' ? new Date().toISOString() : undefined,
                completed_at: bookData.status === 'completed' ? new Date().toISOString() : undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            books.value.push(newBook)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create book'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updateBook(id: number, updates: UpdateBookForm): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // const response = await api.put<ApiResponse<Book>>(`/api/books/${id}`, updates)

            // Temporary mock implementation
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay

            const bookIndex = books.value.findIndex(book => book.id === id)
            if (bookIndex === -1) {
                throw new Error('Book not found')
            }

            const updatedBook = {
                ...books.value[bookIndex],
                ...updates,
                updated_at: new Date().toISOString()
            }

            // Handle status-specific updates
            if (updates.status === 'reading' && books.value[bookIndex].status === 'to_read') {
                updatedBook.started_at = new Date().toISOString()
            } else if (updates.status === 'completed' && books.value[bookIndex].status !== 'completed') {
                updatedBook.completed_at = new Date().toISOString()
                updatedBook.reading_progress = 100
            } else if (updates.status === 'to_read') {
                updatedBook.started_at = undefined
                updatedBook.completed_at = undefined
                updatedBook.reading_progress = 0
            }

            books.value[bookIndex] = updatedBook
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update book'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function deleteBook(id: number): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            // TODO: Replace with actual API call to Gleam backend
            // await api.delete(`/api/books/${id}`)

            // Temporary mock implementation
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay

            const bookIndex = books.value.findIndex(book => book.id === id)
            if (bookIndex === -1) {
                throw new Error('Book not found')
            }

            books.value.splice(bookIndex, 1)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete book'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    function searchBooks(query: string): void {
        searchQuery.value = query
        currentPage.value = 1 // Reset to first page when searching
    }

    function setFilter(key: keyof typeof filters.value, value: string | number | null): void {
        if (key in filters.value) {
            (filters.value as Record<string, string | number | null>)[key] = value
            currentPage.value = 1 // Reset to first page when filtering
        }
    }

    function setSorting(newSortBy: typeof sortBy.value, order: typeof sortOrder.value): void {
        sortBy.value = newSortBy
        sortOrder.value = order
    }

    function setPage(page: number): void {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }

    function clearFilters(): void {
        searchQuery.value = ''
        filters.value = {
            status: 'all',
            genre: 'all',
            rating: null
        }
        currentPage.value = 1
    }

    function clearError(): void {
        error.value = null
    }

    function getBookById(id: number): Book | undefined {
        return books.value.find(book => book.id === id)
    }

    // Initialize with mock data for development
    if (books.value.length === 0) {
        fetchBooks()
    }

    return {
        // State
        books: readonly(books),
        isLoading: readonly(isLoading),
        error: readonly(error),
        searchQuery: readonly(searchQuery),
        filters: readonly(filters),
        sortBy: readonly(sortBy),
        sortOrder: readonly(sortOrder),
        currentPage: readonly(currentPage),
        itemsPerPage: readonly(itemsPerPage),

        // Getters
        filteredBooks,
        paginatedBooks,
        totalPages,
        booksByStatus,
        averageRating,
        genres,

        // Actions
        fetchBooks,
        createBook,
        updateBook,
        deleteBook,
        searchBooks,
        setFilter,
        setSorting,
        setPage,
        clearFilters,
        clearError,
        getBookById
    }
})
