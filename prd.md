# Product Requirements Document (P## Tech Stack

- **Frontend:** Vue 3, Vite, Tailwind CSS v4, Pinia (state), Vue Router
- **HTTP Client:** Axios or Fetch API
- **Backend:** (To be defined, e.g., Node.js/Express, Fastify, or Rust/Go)
- **Database:** (To be defined, e.g., SQLite, PostgreSQL, or file-based storage)
- **Auth:** JWT or session-based
- **Deployment:** Docker/OCI container, Nix service

## Core Libraries

### State Management & Routing

- **Pinia** (state management) - Modern, lightweight store for Vue 3 with DevTools support
- **Vue Router** (routing) - Official router for Vue.js

### Form Handling & Validation

- **VeeValidate** (form validation) - Comprehensive form validation library with excellent Vue 3 support
- **@vee-validate/yup** or **@vee-validate/zod** (schema validation) - Type-safe schema validation

### UI Components & Styling

- **Tailwind CSS v4** (utility-first CSS framework)
- **Headless UI** (unstyled, accessible UI components) - Official Tailwind CSS components
- **Heroicons** (SVG icons) - Beautiful hand-crafted SVG icons
- **Shadcn/ui Vue** (optional) - High-quality components built on Radix UI and Tailwind CSS

### Utilities & Composables

- **VueUse** (composition utilities) - Collection of essential Vue Composition Utilities
  - `useLocalStorage` (persistent state)
  - `useAuth` (authentication helpers)
  - `useFetch` (HTTP requests)
  - `useElementVisibility` (scroll tracking)
  - `usePermission` (browser permissions)
  - `useNetwork` (network status)

### HTTP & API

- **Axios** (HTTP client) - Promise-based HTTP client with interceptors
- **TanStack Query Vue** (optional) - Powerful data synchronization for server state

### Development & Testing

- **Vitest** (unit testing) - Blazing fast unit test framework
- **@vue/test-utils** (Vue testing utilities)
- **Cypress** or **Playwright** (E2E testing)
- **TypeScript** (type safety) - Static type checking

A simple, self-hostable fullstack library web application with three main views: Login, Library, and Settings. Built with Vue 3, Vite, and styled using Tailwind CSS v4. Designed for easy deployment via OCI containers and as a Nix service.

## Goals

- User authentication (login/logout)
- View and manage a personal library (add, edit, remove books)
- User settings (profile, preferences)
- Responsive, modern UI
- Easy self-hosting (OCI container, Nix service)

## Features

### 1. Login View

- User login form with email/username and password
- "Remember me" functionality
- Password visibility toggle
- Form validation with real-time feedback
- Authentication (JWT or session-based)
- Error handling for failed logins
- Registration flow (if enabled)
- Forgot password functionality (optional)

### 2. Library View

- **Book List Display:**
  - Grid/list view toggle
  - Pagination or infinite scroll
  - Sort by: title, author, date added, rating, status
  - Filter by: status, genre, rating
  - Search functionality (title, author, ISBN)

- **Book Management:**
  - Add new books (manual entry or barcode/ISBN lookup)
  - Edit existing books (inline editing or modal)
  - Delete books with confirmation
  - Bulk operations (mark as read, delete multiple)

- **Book Details:**
  - Cover image upload/display
  - Reading progress tracking
  - Personal notes and reviews
  - Reading dates (started, completed)
  - Star rating system

### 3. Settings View

- Update user profile (name, email, password)
- App preferences (theme, etc.)
- Data import/export functionality
- Session management (view active sessions, logout from all devices)

## Data Models

### User

- `id` (unique identifier)
- `email` (unique, required)
- `name` (display name)
- `password_hash` (hashed password)
- `preferences` (JSON object for user settings)
- `created_at`, `updated_at` (timestamps)

### Book

- `id` (unique identifier)
- `user_id` (foreign key to User)
- `title` (required)
- `author` (required)
- `isbn` (optional, unique constraint with user_id)
- `genre` (optional)
- `status` (enum: 'to-read', 'reading', 'completed', 'dnf')
- `rating` (1-5 stars, optional)
- `notes` (user notes, optional)
- `date_added`, `date_started`, `date_completed` (timestamps)
- `created_at`, `updated_at` (timestamps)

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration (if enabled)
- `GET /api/auth/me` - Get current user info

### Books

- `GET /api/books` - List user's books (with pagination, filtering, sorting)
- `POST /api/books` - Add new book
- `GET /api/books/:id` - Get specific book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/search` - Search books (external API integration optional)

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password
- `GET /api/user/export` - Export user data
- `POST /api/user/import` - Import user data

## Security Considerations

- **Authentication:** JWT tokens with secure httpOnly cookies
- **Authorization:** User can only access their own data
- **Input Validation:** Server-side validation for all inputs
- **Rate Limiting:** Prevent brute force attacks
- **CORS:** Properly configured for frontend domain
- **HTTPS:** Force HTTPS in production
- **Password Security:** Bcrypt hashing with salt rounds ≥ 12

## Performance & Optimization

- **Frontend:**
  - Code splitting with Vue Router
  - Lazy loading of components
  - Image optimization
  - Virtual scrolling for large book lists
  - Caching with VueUse `useLocalStorage`

- **Backend:**
  - Database indexing on frequently queried fields
  - Pagination for large datasets
  - Response compression
  - Static asset caching

## Tech Stack

- **Frontend:** Vue 3, Vite, Tailwind CSS v4, Pinia (state), Vue Router, Axios (API)
- **Backend:** (To be defined, e.g., Node.js/Express, Fastify, or Rust/Go)
- **Auth:** JWT or session-based
- **Deployment:** Docker/OCI container, Nix service

## Helpful Libraries

- Pinia (state management)
- Vue Router (routing)
- VeeValidate or VueUseForm (form validation)
- Axios (HTTP client)
- Headless UI or DaisyUI (UI components)
- Heroicons (icons)
- Vitest, Cypress (testing)

## User Experience & Design

### Responsive Design

- Mobile-first approach with responsive breakpoints
- Touch-friendly interface for mobile devices
- Optimized for tablets and desktop

### Accessibility

- WCAG 2.1 compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Theming

- Dark/light mode toggle
- System preference detection
- Customizable accent colors
- Persistent theme selection

### Performance

- Fast loading times (< 3 seconds on 3G)
- Smooth transitions and animations
- Progressive loading for large book collections
- Offline functionality (service workers)

## Deployment & Infrastructure

### Docker/OCI Container

- Multi-stage Dockerfile for optimized builds
- Environment-based configuration
- Health checks and logging
- Volume mounting for persistent data
- Docker Compose for development

### Nix Service

- Nix flake with development shell
- NixOS module for easy deployment
- Reproducible builds across environments
- Automated dependency management

### Production Considerations

- Reverse proxy configuration (nginx/Caddy)
- SSL/TLS termination
- Database backups and migrations
- Log aggregation and monitoring
- Resource limits and scaling

## Non-Goals

- No third-party cloud dependencies
- No complex multi-user or admin features

## Success Criteria

- All features work as described
- App is responsive and visually appealing
- Can be built and run via Docker and Nix

---

*This PRD is a living document and should be updated as requirements evolve.*

## Data Flow Architecture

### Core Principles

Our application follows **SOLID principles** and embraces **functional programming** paradigms to ensure maintainable, testable, and scalable code.

### Data Flow Patterns

#### Parent-to-Child Communication (Props)

- **Unidirectional data flow** from parent views to child components via props
- Props are **immutable** and **reactive** - components never mutate props directly
- Use **computed properties** for derived state from props
- Apply **interface segregation** - components receive only the props they need

```typescript
// Parent View
<BookList 
  :books="books" 
  :loading="isLoading" 
  :filters="activeFilters"
  @book-selected="handleBookSelection"
  @filter-changed="handleFilterChange"
/>

// Child Component
interface BookListProps {
  books: Book[]
  loading: boolean
  filters: BookFilters
}
```

#### Child-to-Parent Communication (Events)

- **Event-driven architecture** using Vue's emit system
- Events carry **pure data** (no side effects in event payloads)
- Follow **command-query separation** - events either trigger actions or request data
- Use **typed events** with TypeScript for better developer experience

```typescript
// Child Component Emits
const emit = defineEmits<{
  'book-selected': [book: Book]
  'filter-changed': [filters: BookFilters]
  'action-requested': [action: BookAction]
}>()
```

### State Management with Pinia

#### Store Architecture (Single Responsibility)

Each store has a **single responsibility** and follows functional programming principles:

```typescript
// stores/booksStore.ts - Pure functions for book operations
export const useBooksStore = defineStore('books', () => {
  // State (immutable references)
  const books = ref<Book[]>([])
  const filters = ref<BookFilters>({})
  const loading = ref(false)

  // Getters (pure computed functions)
  const filteredBooks = computed(() => 
    filterBooks(books.value, filters.value)
  )
  
  const booksByStatus = computed(() => 
    groupBooksByStatus(books.value)
  )

  // Actions (pure functions where possible)
  const setBooks = (newBooks: Book[]) => {
    books.value = newBooks
  }

  const updateBook = (id: string, updates: Partial<Book>) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value[index] = { ...books.value[index], ...updates }
    }
  }

  return {
    // State
    books: readonly(books),
    filters: readonly(filters),
    loading: readonly(loading),
    // Getters
    filteredBooks,
    booksByStatus,
    // Actions
    setBooks,
    updateBook
  }
})
```

#### Functional Utilities

Create **pure utility functions** for data transformations:

```typescript
// utils/bookUtils.ts - Pure functions
export const filterBooks = (books: Book[], filters: BookFilters): Book[] => {
  return books.filter(book => {
    if (filters.status && book.status !== filters.status) return false
    if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) return false
    return true
  })
}

export const groupBooksByStatus = (books: Book[]): Record<BookStatus, Book[]> => {
  return books.reduce((acc, book) => {
    if (!acc[book.status]) acc[book.status] = []
    acc[book.status].push(book)
    return acc
  }, {} as Record<BookStatus, Book[]>)
}
```

### Component Architecture

#### Composition API Best Practices

- **Dependency injection** using Vue's `provide/inject` for cross-cutting concerns
- **Higher-order functions** for reusable logic
- **Pure composables** that don't cause side effects

```typescript
// composables/useBookOperations.ts - Pure composable
export const useBookOperations = () => {
  const booksStore = useBooksStore()

  // Pure functions
  const createBook = (bookData: CreateBookRequest): Book => ({
    id: generateId(),
    ...bookData,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const validateBook = (book: Partial<Book>): ValidationResult => {
    // Pure validation logic
    const errors: string[] = []
    if (!book.title?.trim()) errors.push('Title is required')
    if (!book.author?.trim()) errors.push('Author is required')
    return { isValid: errors.length === 0, errors }
  }

  // Actions that use the store
  const addBook = async (bookData: CreateBookRequest) => {
    const validation = validateBook(bookData)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }
    
    const newBook = createBook(bookData)
    await booksStore.addBook(newBook)
    return newBook
  }

  return {
    createBook,
    validateBook,
    addBook
  }
}
```

### API Layer (Repository Pattern)

Implement **repository pattern** with **dependency inversion**:

```typescript
// services/bookRepository.ts - Interface segregation
interface IBookRepository {
  getBooks(userId: string, filters?: BookFilters): Promise<Book[]>
  getBook(id: string): Promise<Book>
  createBook(book: CreateBookRequest): Promise<Book>
  updateBook(id: string, updates: Partial<Book>): Promise<Book>
  deleteBook(id: string): Promise<void>
}

// Concrete implementation
export class HttpBookRepository implements IBookRepository {
  constructor(private httpClient: HttpClient) {}

  async getBooks(userId: string, filters?: BookFilters): Promise<Book[]> {
    const response = await this.httpClient.get('/api/books', {
      params: { userId, ...filters }
    })
    return response.data
  }

  // ... other methods
}
```

### Error Handling (Functional Approach)

Use **Result pattern** for error handling without exceptions:

```typescript
// utils/result.ts - Functional error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export const ok = <T>(data: T): Result<T> => ({ success: true, data })
export const err = <E>(error: E): Result<never, E> => ({ success: false, error })

// Usage in stores/services
const fetchBooks = async (): Promise<Result<Book[], ApiError>> => {
  try {
    const books = await bookRepository.getBooks(currentUser.id)
    return ok(books)
  } catch (error) {
    return err(new ApiError('Failed to fetch books', error))
  }
}
```

### Testing Strategy (Pure Functions)

- **Unit tests** for pure utility functions
- **Component tests** using Vue Test Utils with mocked dependencies
- **Integration tests** for store actions and API interactions

```typescript
// tests/bookUtils.test.ts - Testing pure functions
describe('filterBooks', () => {
  it('should filter books by status', () => {
    const books = [
      { id: '1', title: 'Book 1', status: 'reading' },
      { id: '2', title: 'Book 2', status: 'completed' }
    ]
    const filters = { status: 'reading' }
    
    const result = filterBooks(books, filters)
    
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})
```

### Benefits of This Architecture

1. **Maintainability** - Clear separation of concerns and single responsibility
2. **Testability** - Pure functions are easy to test in isolation
3. **Reusability** - Functional utilities can be reused across components
4. **Predictability** - Unidirectional data flow makes state changes predictable
5. **Type Safety** - TypeScript interfaces ensure compile-time safety
6. **Performance** - Vue's reactivity system optimizes re-renders automatically
