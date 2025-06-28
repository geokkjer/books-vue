<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore, useUIStore } from '@/stores'
import {
    UiCard,
    UiCardHeader,
    UiCardTitle,
    UiCardContent,
    UiButton,
    UiTable,
    UiTableHeader,
    UiTableBody,
    UiTableRow,
    UiTableHead,
    UiTableCell,
    UiDropdownMenu,
    UiDropdownMenuTrigger,
    UiDropdownMenuContent,
    UiDropdownMenuItem,
    UiDropdownMenuSeparator,
} from '@/components/ui'
import { MoreHorizontal, Plus, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

// Stores
const adminStore = useAdminStore()
const uiStore = useUIStore()

// Computed properties from stores
const users = computed(() => adminStore.users)
const isLoading = computed(() => adminStore.isLoading)
const error = computed(() => adminStore.error)
const systemSettings = computed(() => adminStore.systemSettings)
const stats = computed(() => adminStore.stats)

// Load data when component mounts
onMounted(async () => {
    try {
        await Promise.all([
            adminStore.fetchUsers(),
            adminStore.fetchSystemSettings(),
            adminStore.fetchStats(),
            adminStore.fetchAuditLogs()
        ])
    } catch {
        uiStore.showError('Failed to load admin data', 'Please try refreshing the page.')
    }
})

function editUser(userId: number) {
    const user = adminStore.getUserById(userId)
    if (user) {
        // For now, just show info - this would be expanded with actual edit modal
        uiStore.showInfo('Edit User', `Editing user "${user.name}" - Feature coming soon!`)
    }
}

async function deleteUser(userId: number) {
    try {
        const user = adminStore.getUserById(userId)
        if (user && confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            await adminStore.deleteUser(userId)
            uiStore.showSuccess('User deleted', 'The user has been removed from the system.')
        }
    } catch {
        uiStore.showError('Delete failed', 'Failed to delete the user. Please try again.')
    }
}

function resetPassword(userId: number) {
    const user = adminStore.getUserById(userId)
    if (user) {
        uiStore.showInfo('Reset Password', `Reset password for "${user.name}" - Feature coming soon!`)
    }
}

function addUser() {
    uiStore.showInfo('Add User', 'Add new user functionality coming soon!')
}

function goToLibrary() {
    router.push('/library')
}

function getRoleColor(role: string) {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
}
</script>

<template>
    <div class="container mx-auto p-6 space-y-8">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <UiButton variant="ghost" size="icon" @click="goToLibrary">
                <ArrowLeft class="w-4 h-4" />
            </UiButton>
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Admin Settings</h1>
                <p class="text-muted-foreground">Manage users and system configuration</p>
            </div>
        </div>

        <!-- User Management Section -->
        <UiCard>
            <UiCardHeader>
                <div class="flex items-center justify-between">
                    <div>
                        <UiCardTitle>User Management</UiCardTitle>
                        <p class="text-sm text-muted-foreground mt-1">Manage user accounts and permissions</p>
                    </div>
                    <UiButton @click="addUser">
                        <Plus class="w-4 h-4" />
                        Add User
                    </UiButton>
                </div>
            </UiCardHeader>
            <UiCardContent>
                <!-- Loading state -->
                <div v-if="isLoading" class="flex justify-center py-8">
                    <div class="text-muted-foreground">Loading users...</div>
                </div>

                <!-- Error state -->
                <div v-else-if="error"
                    class="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {{ error }}
                </div>

                <!-- Users table -->
                <UiTable v-else>
                    <UiTableHeader>
                        <UiTableRow>
                            <UiTableHead>Name</UiTableHead>
                            <UiTableHead>Email</UiTableHead>
                            <UiTableHead>Role</UiTableHead>
                            <UiTableHead>Created</UiTableHead>
                            <UiTableHead class="w-12">Actions</UiTableHead>
                        </UiTableRow>
                    </UiTableHeader>
                    <UiTableBody>
                        <UiTableRow v-for="user in users" :key="user.id">
                            <UiTableCell class="font-medium">{{ user.name }}</UiTableCell>
                            <UiTableCell>{{ user.email }}</UiTableCell>
                            <UiTableCell>
                                <span :class="[
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    getRoleColor(user.role)
                                ]">
                                    {{ user.role === 'admin' ? 'Administrator' : 'User' }}
                                </span>
                            </UiTableCell>
                            <UiTableCell class="text-muted-foreground">
                                {{ new Date(user.created_at).toLocaleDateString() }}
                            </UiTableCell>
                            <UiTableCell>
                                <UiDropdownMenu>
                                    <UiDropdownMenuTrigger as-child>
                                        <UiButton variant="ghost" size="icon" class="h-8 w-8">
                                            <MoreHorizontal class="w-4 h-4" />
                                            <span class="sr-only">More options</span>
                                        </UiButton>
                                    </UiDropdownMenuTrigger>
                                    <UiDropdownMenuContent align="end">
                                        <UiDropdownMenuItem @click="editUser(user.id)">
                                            Edit User
                                        </UiDropdownMenuItem>
                                        <UiDropdownMenuItem @click="resetPassword(user.id)">
                                            Reset Password
                                        </UiDropdownMenuItem>
                                        <UiDropdownMenuSeparator />
                                        <UiDropdownMenuItem @click="deleteUser(user.id)"
                                            class="text-destructive focus:text-destructive">
                                            Delete User
                                        </UiDropdownMenuItem>
                                    </UiDropdownMenuContent>
                                </UiDropdownMenu>
                            </UiTableCell>
                        </UiTableRow>
                    </UiTableBody>
                </UiTable>
            </UiCardContent>
        </UiCard>

        <!-- System Settings Section -->
        <UiCard>
            <UiCardHeader>
                <UiCardTitle>System Settings</UiCardTitle>
                <p class="text-sm text-muted-foreground">Configure library preferences</p>
            </UiCardHeader>
            <UiCardContent class="space-y-4">
                <!-- Loading state -->
                <div v-if="isLoading" class="flex justify-center py-4">
                    <div class="text-muted-foreground">Loading settings...</div>
                </div>

                <!-- Settings form -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Library Name</label>
                        <input class="w-full px-3 py-2 border rounded-md" :value="systemSettings.app_name" readonly />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Description</label>
                        <input class="w-full px-3 py-2 border rounded-md" :value="systemSettings.app_description"
                            readonly />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Max Books per User</label>
                        <input class="w-full px-3 py-2 border rounded-md" :value="systemSettings.max_books_per_user"
                            readonly />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Backup Frequency</label>
                        <input class="w-full px-3 py-2 border rounded-md" :value="systemSettings.backup_frequency"
                            readonly />
                    </div>
                </div>

                <!-- Stats -->
                <div v-if="!isLoading" class="mt-6 pt-6 border-t">
                    <h4 class="text-sm font-medium mb-3">System Statistics</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center p-3 bg-muted rounded-lg">
                            <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
                            <div class="text-sm text-muted-foreground">Total Users</div>
                        </div>
                        <div class="text-center p-3 bg-muted rounded-lg">
                            <div class="text-2xl font-bold">{{ stats.totalBooks }}</div>
                            <div class="text-sm text-muted-foreground">Total Books</div>
                        </div>
                        <div class="text-center p-3 bg-muted rounded-lg">
                            <div class="text-2xl font-bold">{{ stats.activeUsers }}</div>
                            <div class="text-sm text-muted-foreground">Active Users</div>
                        </div>
                        <div class="text-center p-3 bg-muted rounded-lg">
                            <div class="text-2xl font-bold">{{ stats.recentActivity }}</div>
                            <div class="text-sm text-muted-foreground">Recent Actions</div>
                        </div>
                    </div>
                </div>

                <UiButton disabled>Save Settings (Coming Soon)</UiButton>
            </UiCardContent>
        </UiCard>
    </div>
</template>
