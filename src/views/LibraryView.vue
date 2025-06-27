<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { MoreHorizontal, Search, Plus } from 'lucide-vue-next'

// Sample book data
const books = ref([
    {
        id: 1,
        title: 'The Vue.js Guide',
        author: 'Evan You',
        genre: 'Technology',
        year: 2023,
        status: 'read',
        cover: 'https://picsum.photos/200/300?random=1'
    },
    {
        id: 2,
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        genre: 'Technology',
        year: 2008,
        status: 'unread',
        cover: 'https://picsum.photos/200/300?random=2'
    },
    {
        id: 3,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Technology',
        year: 2008,
        status: 'reading',
        cover: 'https://picsum.photos/200/300?random=3'
    },
    {
        id: 4,
        title: 'The Pragmatic Programmer',
        author: 'Andy Hunt & Dave Thomas',
        genre: 'Technology',
        year: 1999,
        status: 'read',
        cover: 'https://picsum.photos/200/300?random=4'
    },
    {
        id: 5,
        title: 'Design Patterns',
        author: 'Gang of Four',
        genre: 'Technology',
        year: 1994,
        status: 'unread',
        cover: 'https://picsum.photos/200/300?random=5'
    },
    {
        id: 6,
        title: 'Refactoring',
        author: 'Martin Fowler',
        genre: 'Technology',
        year: 1999,
        status: 'reading',
        cover: 'https://picsum.photos/200/300?random=6'
    }
])

const searchTerm = ref('')

const filteredBooks = computed(() => {
    if (!searchTerm.value) return books.value

    return books.value.filter(book =>
        book.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
})

function getStatusColor(status: string) {
    switch (status) {
        case 'read': return 'bg-green-100 text-green-800'
        case 'reading': return 'bg-blue-100 text-blue-800'
        case 'unread': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

function editBook(bookId: number) {
    console.log('Edit book:', bookId)
}

function deleteBook(bookId: number) {
    const index = books.value.findIndex(book => book.id === bookId)
    if (index !== -1) {
        books.value.splice(index, 1)
    }
}

function markAsRead(bookId: number) {
    const book = books.value.find(book => book.id === bookId)
    if (book) {
        book.status = 'read'
    }
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
            <UiButton class="md:w-auto">
                <Plus class="w-4 h-4" />
                Add Book
            </UiButton>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <UiInput v-model="searchTerm" placeholder="Search books..." class="pl-10" />
            </div>
            <div class="text-sm text-muted-foreground">
                {{ filteredBooks.length }} of {{ books.length }} books
            </div>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <UiCard v-for="book in filteredBooks" :key="book.id"
                class="overflow-hidden transition-shadow hover:shadow-lg">
                <div class="aspect-[3/4] bg-muted flex items-center justify-center">
                    <img :src="book.cover" :alt="book.title" class="w-full h-full object-cover" />
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
                                <UiDropdownMenuItem v-if="book.status !== 'read'" @click="markAsRead(book.id)">
                                    Mark as Read
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
                        <span class="text-sm text-muted-foreground">{{ book.year }}</span>
                        <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(book.status)]">
                            {{ book.status }}
                        </span>
                    </div>
                </UiCardContent>
            </UiCard>
        </div>

        <!-- Empty State -->
        <div v-if="filteredBooks.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search class="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-medium mb-2">No books found</h3>
            <p class="text-muted-foreground mb-4">
                {{ searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first book' }}
            </p>
            <UiButton v-if="!searchTerm">
                <Plus class="w-4 h-4" />
                Add Your First Book
            </UiButton>
        </div>
    </div>
</template>
