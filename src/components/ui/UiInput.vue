<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
    type?: string
    class?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    modelValue?: string | number
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
    change: [event: Event]
    input: [event: Event]
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
}>()

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
    emit('input', event)
}
</script>

<template>
    <input :type="props.type" :class="cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        props.class
    )" :placeholder="props.placeholder" :disabled="props.disabled" :readonly="props.readonly" :value="props.modelValue"
        @input="handleInput" @change="$emit('change', $event)" @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)" />
</template>
