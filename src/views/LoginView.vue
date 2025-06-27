<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
const username = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleSubmit() {
    isLoading.value = true

    // Simulate login logic
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For demo purposes, accept any non-empty credentials
    if (username.value && password.value) {
        router.push('/library')
    }

    isLoading.value = false
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

                    <UiButton type="submit" class="w-full" :disabled="isLoading">
                        {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </UiButton>
                </form>

                <div class="text-center text-sm text-muted-foreground">
                    <p>Demo: Use any username and password to sign in</p>
                </div>
            </UiCardContent>
        </UiCard>
    </div>
</template>
