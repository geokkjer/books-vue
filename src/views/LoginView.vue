<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useUIStore } from '@/stores'
import {
    UiCard,
    UiCardHeader,
    UiCardTitle,
    UiCardContent,
    UiInput,
    UiLabel,
    UiButton
} from '@/components/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

// Form data
const username = ref('')
const password = ref('')
const rememberMe = ref(false)

// Computed properties from stores
const isLoading = computed(() => authStore.isLoading)
const error = computed(() => authStore.error)

async function handleSubmit() {
    try {
        await authStore.login({
            username: username.value,
            password: password.value,
            remember: rememberMe.value
        })

        // Show success notification
        uiStore.showSuccess('Welcome back!', 'You have been successfully logged in.')

        // Navigate to library if login was successful
        if (authStore.isAuthenticated) {
            router.push('/library')
        }
    } catch {
        // Error handling is done in the store, but we can show additional UI feedback
        uiStore.showError(
            'Login Failed',
            error.value || 'Please check your credentials and try again.'
        )
    }
}

// Dev login for easy testing
async function handleDevLogin() {
    username.value = 'admin'
    password.value = 'password'
    rememberMe.value = true
    await handleSubmit()
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-background p-4">
        <UiCard class="w-full max-w-md">
            <UiCardHeader class="text-center">
                <UiCardTitle class="text-2xl font-bold">Welcome Back</UiCardTitle>
                <p class="text-muted-foreground">Sign in to access your book library</p>
            </UiCardHeader>
            <UiCardContent class="space-y-4">
                <!-- Display error message if there's an error -->
                <div v-if="error"
                    class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {{ error }}
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="space-y-2">
                        <UiLabel for="username">Username</UiLabel>
                        <UiInput id="username" v-model="username" type="text" placeholder="Enter your username"
                            :disabled="isLoading" required />
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="password">Password</UiLabel>
                        <UiInput id="password" v-model="password" type="password" placeholder="Enter your password"
                            :disabled="isLoading" required />
                    </div>

                    <div class="flex items-center space-x-2">
                        <input id="remember" v-model="rememberMe" type="checkbox" class="rounded border-border"
                            :disabled="isLoading" />
                        <UiLabel for="remember" class="text-sm font-normal">Remember me</UiLabel>
                    </div>

                    <UiButton type="submit" class="w-full" :disabled="isLoading">
                        {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </UiButton>
                </form>

                <!-- Dev Login Section -->
                <div class="border-t pt-4">
                    <div class="text-center text-sm text-muted-foreground mb-3">
                        <p>Development Mode</p>
                    </div>
                    <UiButton @click="handleDevLogin" variant="outline" class="w-full" :disabled="isLoading">
                        🚀 Quick Login (admin)
                    </UiButton>
                </div>

                <div class="text-center text-sm text-muted-foreground">
                    <p>Self-hosted book library system</p>
                </div>
            </UiCardContent>
        </UiCard>
    </div>
</template>
