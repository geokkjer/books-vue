# Shadcn-vue Components for Books Library

This document specifies the exact shadcn-vue components to use for each view in the books library application.

## Installation Commands

Install the required components using the shadcn-vue CLI:

```bash
# Core components for all views
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add input
npx shadcn-vue@latest add form
npx shadcn-vue@latest add table
npx shadcn-vue@latest add dropdown-menu

# Additional components for enhanced UX
npx shadcn-vue@latest add hover-card
npx shadcn-vue@latest add combobox
npx shadcn-vue@latest add pagination
npx shadcn-vue@latest add sidebar
npx shadcn-vue@latest add number-field
```

## Component Selection by View

### 1. Login View (`LoginView.vue`)

**Components to use:**

- `Card` (with CardHeader, CardContent, CardFooter)
- `Form` (with FormField, FormItem, FormLabel, FormControl, FormMessage)
- `Input`
- `Button`

**Implementation structure:**

```vue
<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to Your Library</CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <FormField name="username">
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <FormField name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <Button type="submit" class="w-full">Sign In</Button>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>
```

### 2. Library View (`LibraryView.vue`)

**Components to use:**

- `Card` (for book display)
- `Table` (with TableHeader, TableBody, TableRow, TableCell)
- `Input` (for search)
- `Button` (for actions)
- `DropdownMenu` (for book actions)
- `Combobox` (for filters)
- `Pagination`
- `HoverCard` (for book previews)

**Implementation structure:**

```vue
<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Combobox } from '@/components/ui/combobox'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Search and Filters -->
    <div class="flex gap-4 mb-6">
      <Input placeholder="Search books..." class="max-w-sm" />
      <Combobox placeholder="Filter by genre..." />
      <Button>Add Book</Button>
    </div>

    <!-- Books Display (Card or Table view toggle) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="book in books" :key="book.id">
        <CardHeader>
          <CardTitle class="text-lg">{{ book.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">{{ book.author }}</p>
          <div class="flex justify-between items-center mt-4">
            <span class="text-sm">{{ book.year }}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">⋯</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem>Mark as Read</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Pagination -->
    <Pagination class="mt-8" />
  </div>
</template>
```

### 3. Admin Settings View (`SettingsView.vue`)

**Components to use:**

- `Card` (for different settings sections)
- `Table` (for user management)
- `Form` (for settings forms)
- `Input`
- `Button`
- `DropdownMenu` (for user actions)
- `NumberField` (for numeric settings)

**Implementation structure:**

```vue
<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NumberField, NumberFieldContent, NumberFieldInput, NumberFieldDecrement, NumberFieldIncrement } from '@/components/ui/number-field'
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <!-- User Management Section -->
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <div class="flex justify-between items-center">
          <p class="text-sm text-muted-foreground">Manage user accounts and permissions</p>
          <Button>Add New User</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>{{ user.username }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>{{ user.role }}</TableCell>
              <TableCell>{{ user.is_active ? 'Active' : 'Inactive' }}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">⋯</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Deactivate</DropdownMenuItem>
                    <DropdownMenuItem>Reset Password</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- System Settings Section -->
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form class="space-y-4">
          <FormField name="library_name">
            <FormItem>
              <FormLabel>Library Name</FormLabel>
              <FormControl>
                <Input placeholder="My Book Library" />
              </FormControl>
            </FormItem>
          </FormField>
          
          <FormField name="books_per_page">
            <FormItem>
              <FormLabel>Books per Page</FormLabel>
              <FormControl>
                <NumberField>
                  <NumberFieldContent>
                    <NumberFieldDecrement />
                    <NumberFieldInput />
                    <NumberFieldIncrement />
                  </NumberFieldContent>
                </NumberField>
              </FormControl>
            </FormItem>
          </FormField>
          
          <Button type="submit">Save Settings</Button>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>
```

## Data Table Implementation

For advanced table functionality in the Library view, you can use TanStack Vue Table with shadcn-vue components:

```vue
<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Define columns for books table
const columns: ColumnDef<Book>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Title', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'genre',
    header: 'Genre',
  },
  {
    accessorKey: 'year',
    header: 'Year',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(DropdownMenu, {}, {
        default: () => [
          h(DropdownMenuTrigger, { asChild: true }, {
            default: () => h(Button, { variant: 'ghost', size: 'sm' }, () => '⋯')
          }),
          h(DropdownMenuContent, {}, {
            default: () => [
              h(DropdownMenuItem, {}, () => 'Edit'),
              h(DropdownMenuItem, {}, () => 'Delete'),
            ]
          })
        ]
      })
    },
  },
]
</script>
```

## Key Features by Component

### Forms

- **Validation**: Built-in integration with VeeValidate
- **Accessibility**: Proper ARIA labels and error handling
- **Styling**: Consistent with design system

### Tables

- **Sorting**: Click headers to sort columns
- **Filtering**: Search/filter functionality
- **Pagination**: Built-in pagination controls
- **Actions**: Dropdown menus for row actions

### Cards

- **Responsive**: Adapts to different screen sizes
- **Hover effects**: Enhanced UX with hover cards
- **Consistent spacing**: Follows design system

### Navigation

- **Dropdown menus**: Context-sensitive actions
- **Buttons**: Various variants (primary, secondary, ghost, outline)
- **Accessibility**: Keyboard navigation support

## Design Considerations

1. **Consistency**: All components follow the same design tokens
2. **Accessibility**: WCAG compliant with proper ARIA attributes
3. **Responsiveness**: Mobile-first design with responsive breakpoints
4. **Dark mode**: Built-in dark mode support
5. **Customization**: Easy to customize with CSS variables

This component selection provides a complete, professional UI foundation for your books library application while maintaining consistency and excellent user experience.
