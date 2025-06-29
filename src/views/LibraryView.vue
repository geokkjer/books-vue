<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore, useUIStore, useAuthStore } from '@/stores'
import {
    UiCard,
    UiCardHeader,
    UiCardTitle,
    UiCardContent,
    UiInput,
    UiButton,
    UiDropdownMenu,
    UiDropdownMenuTrigger,
    UiDropdownMenuContent,
    UiDropdownMenuItem,
    UiDropdownMenuSeparator,
} from '@/components/ui'
import { MoreHorizontal, Search, Plus, User } from 'lucide-vue-next'

// Stores
const router = useRouter()
const libraryStore = useLibraryStore()
const uiStore = useUIStore()
const authStore = useAuthStore()

// Computed properties from stores
const books = computed(() => libraryStore.paginatedBooks)
const isLoading = computed(() => libraryStore.isLoading)
const searchQuery = computed({
    get: () => libraryStore.searchQuery,
    set: (value: string) => libraryStore.searchBooks(value)
})
const totalBooks = computed(() => libraryStore.books.length)
const currentPage = computed(() => libraryStore.currentPage)
const totalPages = computed(() => libraryStore.totalPages)
const currentUser = computed(() => authStore.user)

// Load books when component mounts
onMounted(async () => {
    try {
        await libraryStore.fetchBooks()
    } catch {
        uiStore.showError('Failed to load books', 'Please try refreshing the page.')
    }
})

function getStatusColor(status: string) {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800'
        case 'reading': return 'bg-blue-100 text-blue-800'
        case 'to_read': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'completed': return 'Completed'
        case 'reading': return 'Reading'
        case 'to_read': return 'To Read'
        default: return status
    }
}

function handleAddBook() {
    uiStore.openModal('addBook')
}

async function editBook(bookId: number) {
    // Set the book to edit and open modal
    // For now, just show info - this would be expanded with actual edit logic
    const book = libraryStore.books.find(b => b.id === bookId)
    if (book) {
        uiStore.showInfo('Edit Book', `Editing "${book.title}" - Feature coming soon!`)
    }
}

async function deleteBook(bookId: number) {
    try {
        const book = libraryStore.books.find(b => b.id === bookId)
        if (book && confirm(`Are you sure you want to delete "${book.title}"?`)) {
            await libraryStore.deleteBook(bookId)
            uiStore.showSuccess('Book deleted', 'The book has been removed from your library.')
        }
    } catch {
        uiStore.showError('Delete failed', 'Failed to delete the book. Please try again.')
    }
}

async function updateBookStatus(bookId: number, newStatus: 'to_read' | 'reading' | 'completed') {
    try {
        await libraryStore.updateBook(bookId, { status: newStatus })
        uiStore.showSuccess('Status updated', 'Book status has been updated.')
    } catch {
        uiStore.showError('Update failed', 'Failed to update book status. Please try again.')
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        libraryStore.setPage(currentPage.value + 1)
    }
}

function prevPage() {
    if (currentPage.value > 1) {
        libraryStore.setPage(currentPage.value - 1)
    }
}

function goToSettings() {
    router.push('/settings')
}
</script>

<template>
    <div class="container mx-auto p-6 space-y-8">
        <!-- Header -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">My Library</h1>
                <p class="text-muted-foreground">Manage your personal book collection</p>
            </div>
            <UiButton @click="goToSettings" variant="outline" class="md:w-auto">
                <User class="w-4 h-4" />
                {{ currentUser?.name || 'User' }}
            </UiButton>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <UiInput v-model="searchQuery" placeholder="Search books..." class="pl-10" />
            </div>
            <div class="flex items-center gap-4">
                <div class="text-sm text-muted-foreground">
                    {{ books.length }} books ({{ totalBooks }} total)
                </div>
                <UiButton @click="handleAddBook" size="sm">
                    <Plus class="w-4 h-4" />
                    Add Book
                </UiButton>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-12">
            <div class="text-muted-foreground">Loading your books...</div>
        </div>

        <!-- Books Grid -->
        <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <UiCard v-for="book in books" :key="book.id" class="overflow-hidden transition-shadow hover:shadow-lg">
                <div class="aspect-[3/4] bg-muted flex items-center justify-center">
                    <img v-if="book.cover_image" :src="book.cover_image" :alt="book.title"
                        class="w-full h-full object-cover" />
                    <div v-else class="text-muted-foreground text-center p-4">
                        <div class="text-lg font-medium">{{ book.title.substring(0, 20) }}...</div>
                        <div class="text-sm">No cover</div>
                    </div>
                </div>

                <UiCardHeader class="pb-2">
                    <div class="flex items-start justify-between">
                        <UiCardTitle class="text-lg line-clamp-2">{{ book.title }}</UiCardTitle>
                        <UiDropdownMenu>
                            <UiDropdownMenuTrigger as-child>
                                <UiButton variant="ghost" size="icon" class="h-8 w-8">
                                    <MoreHorizontal class="w-4 h-4" />
                                    <span class="sr-only">More options</span>
                                </UiButton>
                            </UiDropdownMenuTrigger>
                            <UiDropdownMenuContent align="end">
                                <UiDropdownMenuItem @click="editBook(book.id)">
                                    Edit
                                </UiDropdownMenuItem>
                                <UiDropdownMenuItem v-if="book.status !== 'completed'"
                                    @click="updateBookStatus(book.id, 'completed')">
                                    Mark as Completed
                                </UiDropdownMenuItem>
                                <UiDropdownMenuItem v-if="book.status !== 'reading'"
                                    @click="updateBookStatus(book.id, 'reading')">
                                    Mark as Reading
                                </UiDropdownMenuItem>
                                <UiDropdownMenuItem v-if="book.status !== 'to_read'"
                                    @click="updateBookStatus(book.id, 'to_read')">
                                    Mark as To Read
                                </UiDropdownMenuItem>
                                <UiDropdownMenuSeparator />
                                <UiDropdownMenuItem @click="deleteBook(book.id)"
                                    class="text-destructive focus:text-destructive">
                                    Delete
                                </UiDropdownMenuItem>
                            </UiDropdownMenuContent>
                        </UiDropdownMenu>
                    </div>
                </UiCardHeader>

                <UiCardContent class="pt-0">
                    <p class="text-sm text-muted-foreground mb-2">{{ book.author }}</p>
                    <div class="flex items-center justify-between">
                        <span v-if="book.genre" class="text-sm text-muted-foreground">{{ book.genre }}</span>
                        <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(book.status)]">
                            {{ getStatusLabel(book.status) }}
                        </span>
                    </div>
                    <div v-if="book.rating" class="mt-2 flex items-center">
                        <span class="text-sm text-muted-foreground">Rating: {{ book.rating }}/5</span>
                    </div>
                </UiCardContent>
            </UiCard>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && books.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search class="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-medium mb-2">No books found</h3>
            <p class="text-muted-foreground mb-4">
                {{ searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first book' }}
            </p>
            <UiButton v-if="!searchQuery" @click="handleAddBook">
                <Plus class="w-4 h-4" />
                Add Your First Book
            </UiButton>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoading && totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
            <UiButton @click="prevPage" :disabled="currentPage === 1" variant="outline">
                Previous
            </UiButton>
            <span class="text-sm text-muted-foreground">
                Page {{ currentPage }} of {{ totalPages }}
            </span>
            <UiButton @click="nextPage" :disabled="currentPage === totalPages" variant="outline">
                Next
            </UiButton>
        </div>
    </div>
</template>
