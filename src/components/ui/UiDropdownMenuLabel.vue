<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends DropdownMenuLabelProps {
    class?: string
    inset?: boolean
}

const props = defineProps<Props>()
</script>

<template>
    <DropdownMenuLabel v-bind="{ ...props, class: undefined, inset: undefined }" :class="cn(
        'px-2 py-1.5 text-sm font-semibold',
        props.inset && 'pl-8',
        props.class
    )">
        <slot />
    </DropdownMenuLabel>
</template>
