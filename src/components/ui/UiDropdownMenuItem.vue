<script setup lang="ts">
import { DropdownMenuItem, type DropdownMenuItemProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends DropdownMenuItemProps {
    class?: string
    inset?: boolean
}

const props = defineProps<Props>()
</script>

<template>
    <DropdownMenuItem v-bind="{ ...props, class: undefined, inset: undefined }" :class="cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
        props.inset && 'pl-8',
        props.class
    )">
        <slot />
    </DropdownMenuItem>
</template>
