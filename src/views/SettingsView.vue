<script setup lang="ts">
import { ref } from 'vue'
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
import { useRouter } from 'vue-router'

const router = useRouter()

// Sample user data
const users = ref([
    {
        id: 1,
        username: 'admin',
        email: 'admin@library.local',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-15'
    },
    {
        id: 2,
        username: 'alice',
        email: 'alice@family.local',
        role: 'user',
        isActive: true,
        createdAt: '2024-02-20'
    },
    {
        id: 3,
        username: 'bob',
        email: 'bob@family.local',
        role: 'user',
        isActive: false,
        createdAt: '2024-03-10'
    }
])

function editUser(userId: number) {
    console.log('Edit user:', userId)
}

function deactivateUser(userId: number) {
    const user = users.value.find(u => u.id === userId)
    if (user) {
        user.isActive = !user.isActive
    }
}

function resetPassword(userId: number) {
    console.log('Reset password for user:', userId)
}

function goToLibrary() {
    router.push('/library')
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
                    <UiButton>
                        <Plus class="w-4 h-4" />
                        Add User
                    </UiButton>
                </div>
            </UiCardHeader>
            <UiCardContent>
                <UiTable>
                    <UiTableHeader>
                        <UiTableRow>
                            <UiTableHead>Username</UiTableHead>
                            <UiTableHead>Email</UiTableHead>
                            <UiTableHead>Role</UiTableHead>
                            <UiTableHead>Status</UiTableHead>
                            <UiTableHead>Created</UiTableHead>
                            <UiTableHead class="w-12">Actions</UiTableHead>
                        </UiTableRow>
                    </UiTableHeader>
                    <UiTableBody>
                        <UiTableRow v-for="user in users" :key="user.id">
                            <UiTableCell class="font-medium">{{ user.username }}</UiTableCell>
                            <UiTableCell>{{ user.email }}</UiTableCell>
                            <UiTableCell>
                                <span :class="[
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                ]">
                                    {{ user.role }}
                                </span>
                            </UiTableCell>
                            <UiTableCell>
                                <span :class="[
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                ]">
                                    {{ user.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </UiTableCell>
                            <UiTableCell class="text-muted-foreground">{{ user.createdAt }}</UiTableCell>
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
                                        <UiDropdownMenuItem @click="deactivateUser(user.id)">
                                            {{ user.isActive ? 'Deactivate' : 'Activate' }} User
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Library Name</label>
                        <input class="w-full px-3 py-2 border rounded-md" value="My Personal Library" readonly />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Books per Page</label>
                        <input class="w-full px-3 py-2 border rounded-md" value="12" readonly />
                    </div>
                </div>
                <UiButton>Save Settings</UiButton>
            </UiCardContent>
        </UiCard>
    </div>
</template>
