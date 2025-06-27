// Store Demo and Testing File
// This file demonstrates how to use all the Pinia stores
// Run this in the browser console or import in a component to test

import { useAuthStore, useLibraryStore, useUIStore, useAdminStore } from '@/stores'

export function demonstrateStores() {
    console.log('🔧 Testing Pinia Store Implementation...\n')

    // Test Auth Store
    console.log('📝 Auth Store Demo:')
    const authStore = useAuthStore()
    console.log('- Initial auth state:', authStore.isAuthenticated)
    console.log('- Current user:', authStore.user)
    console.log('- Is admin:', authStore.isAdmin)

    // Test Library Store
    console.log('\n📚 Library Store Demo:')
    const libraryStore = useLibraryStore()
    console.log('- Total books:', libraryStore.books.length)
    console.log('- Filtered books count:', libraryStore.filteredBooks.length)
    console.log('- Current page:', libraryStore.currentPage)

    // Test UI Store
    console.log('\n🎨 UI Store Demo:')
    const uiStore = useUIStore()
    console.log('- Dark mode:', uiStore.isDarkMode)
    console.log('- Has notifications:', uiStore.hasNotifications)
    console.log('- Is any modal open:', uiStore.isAnyModalOpen)

    // Test Admin Store
    console.log('\n⚙️ Admin Store Demo:')
    const adminStore = useAdminStore()
    console.log('- Total users:', adminStore.totalUsers)
    console.log('- Admin users:', adminStore.adminUsers.length)
    console.log('- System settings:', adminStore.systemSettings.app_name)

    console.log('\n✅ All stores loaded successfully!')

    return {
        authStore,
        libraryStore,
        uiStore,
        adminStore,
    }
}

// Example of how to use stores in a component
export function exampleStoreUsage() {
    // In a Vue component, you would do:
    /*
    <script setup>
    import { useAuthStore, useLibraryStore, useUIStore } from '@/stores'
    
    const authStore = useAuthStore()
    const libraryStore = useLibraryStore()
    const uiStore = useUIStore()
    
    // Use reactive state
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    const books = computed(() => libraryStore.filteredBooks)
    
    // Use actions
    const login = async (credentials) => {
      await authStore.login(credentials)
      uiStore.showSuccess('Success', 'Logged in successfully!')
    }
    
    const addBook = async (bookData) => {
      await libraryStore.createBook(bookData)
      uiStore.showSuccess('Success', 'Book added to your library!')
    }
    </script>
    
    <template>
      <div v-if="isLoggedIn">
        <h1>Your Books ({{ books.length }})</h1>
        <button @click="uiStore.toggleDarkMode()">
          Toggle {{ uiStore.isDarkMode ? 'Light' : 'Dark' }} Mode
        </button>
      </div>
    </template>
    */
}
