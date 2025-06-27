# Gleam Backend Research - Erlang VM + SQLite

## Overview

This document researches using Gleam as the backend technology for the books library application, running on the Erlang Virtual Machine (BEAM) with SQLite as the database. Gleam is a type-safe functional programming language that compiles to Erlang, offering the reliability and concurrency of the BEAM ecosystem with modern language features.

## Why Gleam + Erlang VM + SQLite?

### ✅ **Perfect Match for Self-Hosted Applications**

- **Type Safety**: Gleam's strong type system prevents runtime errors
- **Fault Tolerance**: Erlang VM's "let it crash" philosophy with supervisor trees
- **Concurrency**: Actor model with lightweight processes (perfect for handling multiple users)
- **SQLite**: Embedded database, perfect for self-hosted single-instance deployments
- **No External Dependencies**: SQLite requires no separate database server
- **Simple Deployment**: Single binary + database file

## Gleam Language Overview

### 🎯 **Key Features**

- **Functional Programming**: Immutable data, pattern matching, no null values
- **Type Safe**: Compile-time guarantees, no runtime type errors
- **Familiar Syntax**: Clean, readable syntax inspired by Rust and Elm
- **Interop**: Can call Erlang and Elixir code seamlessly
- **Compiled**: Compiles to efficient Erlang bytecode
- **Modern Tooling**: Built-in package manager, formatter, LSP support

### 📊 **Language Characteristics**

```gleam
// Example Gleam code structure
import gleam/http/response.{Response}
import gleam/json
import gleam/result

pub type Book {
  Book(
    id: Int,
    title: String,
    author: String,
    isbn: Option(String),
    status: BookStatus,
  )
}

pub type BookStatus {
  ToRead
  Reading
  Completed
}

pub fn handle_get_books() -> Response(String) {
  case get_all_books() {
    Ok(books) -> 
      books
      |> json.encode_list(encode_book)
      |> response.new(200)
    Error(_) -> 
      response.new(500)
      |> response.set_body("Internal server error")
  }
}
```

## Web Framework Options

### 1. **Mist** ⭐⭐⭐⭐⭐ (Recommended)

**URL**: <https://github.com/gleam-lang/mist>

#### Features

- **Official Gleam HTTP Server**: Maintained by the Gleam team
- **Built on Erlang/OTP**: Uses Erlang's cowboy under the hood
- **Type-Safe Routing**: Compile-time route validation
- **Middleware Support**: Built-in middleware for common tasks
- **WebSocket Support**: Real-time features if needed
- **Production Ready**: Used in production Gleam applications

#### Example Usage

```gleam
import mist
import gleam/http/request.{Request}
import gleam/http/response.{Response}

pub fn main() {
  let handler = fn(req: Request(t)) -> Response(String) {
    case request.path_segments(req) {
      ["api", "books"] -> handle_books(req)
      ["api", "auth", "login"] -> handle_login(req)
      _ -> response.new(404) |> response.set_body("Not Found")
    }
  }

  mist.new(handler)
  |> mist.port(8080)
  |> mist.start_http
}
```

#### Pros

- ✅ Official support and maintenance
- ✅ Excellent type safety
- ✅ Simple, functional API design
- ✅ Good documentation and examples
- ✅ WebSocket support for real-time features

#### Cons

- ⚠️ Smaller ecosystem compared to Express/FastAPI
- ⚠️ Fewer third-party middleware options

---

### 2. **Wisp** ⭐⭐⭐⭐

**URL**: <https://github.com/gleam-lang/wisp>

#### Features

- **Gleam Web Framework**: Higher-level than Mist
- **Middleware Pipeline**: Composable middleware system
- **Static File Serving**: Built-in static file handling
- **Security Headers**: Automatic security header management
- **Session Management**: Built-in session support

#### Example Usage

```gleam
import wisp
import gleam/string_builder

pub fn main() {
  let secret_key_base = wisp.random_string(64)
  
  wisp.new()
  |> wisp.secret_key_base(secret_key_base)
  |> wisp.middleware_stack
  |> wisp.router([
    wisp.get("/api/books", handle_get_books),
    wisp.post("/api/books", handle_create_book),
    wisp.put("/api/books/:id", handle_update_book),
  ])
  |> wisp.serve_at("localhost", 8080)
}

fn handle_get_books(req) {
  // Handler implementation
  wisp.ok()
  |> wisp.json_body(books_json)
}
```

#### Pros

- ✅ Higher-level abstractions
- ✅ Built-in middleware for common tasks
- ✅ Automatic security headers
- ✅ Good for rapid development

#### Cons

- ⚠️ Less control than Mist
- ⚠️ Newer, smaller community

---

## Database Integration with SQLite

### 1. **gleam_sqlite** ⭐⭐⭐⭐⭐

**URL**: <https://github.com/gleam-lang/sqlite>

#### Features

- **Official Gleam SQLite Library**: Maintained by Gleam team
- **Type-Safe Queries**: Compile-time query validation
- **Connection Pooling**: Built-in connection management
- **Prepared Statements**: Automatic SQL injection prevention
- **Transaction Support**: ACID compliance

#### Example Usage

```gleam
import gleam/sqlite
import gleam/result

pub type DatabaseError {
  ConnectionError
  QueryError(String)
}

pub fn init_database() -> Result(sqlite.Connection, DatabaseError) {
  sqlite.open("./books.db")
  |> result.map_error(fn(_) { ConnectionError })
}

pub fn create_books_table(db: sqlite.Connection) -> Result(Nil, DatabaseError) {
  let sql = "
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'to_read',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  "
  
  sqlite.exec(sql, db)
  |> result.map_error(fn(err) { QueryError(sqlite.error_to_string(err)) })
}

pub fn insert_book(db: sqlite.Connection, book: Book) -> Result(Int, DatabaseError) {
  let sql = "
    INSERT INTO books (title, author, isbn, status)
    VALUES (?, ?, ?, ?)
  "
  
  sqlite.prepare(sql, db)
  |> result.then(fn(stmt) {
    sqlite.bind(stmt, [
      sqlite.text(book.title),
      sqlite.text(book.author),
      sqlite.nullable_text(book.isbn),
      sqlite.text(book_status_to_string(book.status))
    ])
    |> result.then(fn(_) { sqlite.step(stmt) })
    |> result.then(fn(_) { sqlite.last_insert_rowid(db) })
  })
  |> result.map_error(fn(err) { QueryError(sqlite.error_to_string(err)) })
}

pub fn get_all_books(db: sqlite.Connection) -> Result(List(Book), DatabaseError) {
  let sql = "SELECT id, title, author, isbn, status FROM books ORDER BY created_at DESC"
  
  sqlite.prepare(sql, db)
  |> result.then(fn(stmt) { sqlite.query(stmt) })
  |> result.map(fn(rows) {
    list.map(rows, row_to_book)
  })
  |> result.map_error(fn(err) { QueryError(sqlite.error_to_string(err)) })
}
```

#### Pros

- ✅ Official Gleam library
- ✅ Type-safe database operations
- ✅ Excellent error handling
- ✅ No external dependencies
- ✅ Perfect for self-hosted applications

#### Cons

- ⚠️ SQLite limitations (single writer, no network access)
- ⚠️ No ORM-style abstractions (but this can be a pro for some)

---

### 2. **Alternative: cake** ⭐⭐⭐

**URL**: <https://github.com/gleam-lang/cake>

#### Features

- **Query Builder**: Higher-level SQL building
- **Multiple Database Support**: SQLite, PostgreSQL, MySQL
- **Type-Safe Queries**: Compile-time query validation
- **Migration Support**: Database schema versioning

#### Example Usage

```gleam
import cake/select
import cake/where
import cake/insert

pub fn get_books_by_status(db, status: BookStatus) {
  select.new()
  |> select.from_table("books")
  |> select.columns(["id", "title", "author", "status"])
  |> select.where(where.eq("status", book_status_to_string(status)))
  |> select.execute(db)
}
```

---

## Authentication & Authorization

### JWT Implementation

```gleam
import gleam/jwt
import gleam/crypto
import gleam/json

pub type Claims {
  Claims(
    user_id: Int,
    email: String,
    role: UserRole,
    exp: Int,
  )
}

pub fn create_jwt_token(user: User) -> Result(String, String) {
  let claims = Claims(
    user_id: user.id,
    email: user.email,
    role: user.role,
    exp: current_timestamp() + 86400, // 24 hours
  )
  
  jwt.encode(claims, secret_key())
}

pub fn verify_jwt_token(token: String) -> Result(Claims, String) {
  jwt.decode(token, secret_key())
}
```

### Password Hashing

```gleam
import gleam/crypto

pub fn hash_password(password: String) -> String {
  crypto.hash(crypto.Sha256, password <> salt())
  |> crypto.base16_encode
}

pub fn verify_password(password: String, hash: String) -> Bool {
  hash_password(password) == hash
}
```

---

## Project Structure

### Recommended Directory Layout

```
books-backend-gleam/
├── gleam.toml                 # Project configuration
├── src/
│   ├── books_backend.gleam    # Main application entry point
│   ├── router.gleam           # HTTP routing
│   ├── handlers/              # Request handlers
│   │   ├── auth.gleam
│   │   ├── books.gleam
│   │   └── users.gleam
│   ├── models/                # Data types and business logic
│   │   ├── book.gleam
│   │   ├── user.gleam
│   │   └── auth.gleam
│   ├── database/              # Database layer
│   │   ├── connection.gleam
│   │   ├── books.gleam
│   │   └── users.gleam
│   ├── middleware/            # HTTP middleware
│   │   ├── auth.gleam
│   │   ├── cors.gleam
│   │   └── logging.gleam
│   └── utils/                 # Utility functions
│       ├── jwt.gleam
│       ├── validation.gleam
│       └── config.gleam
├── test/                      # Test files
├── priv/                      # Static files, migrations
│   └── migrations/
└── books.db                   # SQLite database file
```

---

## API Design Example

### RESTful API Structure

```gleam
// Authentication
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// Books
GET    /api/books              # List books with filtering
POST   /api/books              # Create new book
GET    /api/books/:id          # Get specific book
PUT    /api/books/:id          # Update book
DELETE /api/books/:id          # Delete book

// Users (Admin only)
GET    /api/users              # List users
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user

// Metadata
GET    /api/metadata/isbn/:isbn # ISBN lookup
```

### Response Format

```gleam
pub type ApiResponse(data) {
  Success(data: data)
  Error(message: String, code: Int)
}

pub fn encode_api_response(response: ApiResponse(data), encode_data: fn(data) -> json.Json) -> String {
  case response {
    Success(data) ->
      json.object([
        #("success", json.bool(True)),
        #("data", encode_data(data))
      ])
    Error(message, code) ->
      json.object([
        #("success", json.bool(False)),
        #("error", json.string(message)),
        #("code", json.int(code))
      ])
  }
  |> json.to_string
}
```

---

## Deployment Strategy

### 1. **Single Binary Deployment**

```gleam
// Build configuration in gleam.toml
[dependencies]
gleam_stdlib = "~> 0.34"
mist = "~> 1.0"
gleam_sqlite = "~> 1.0"
gleam_json = "~> 1.0"
gleam_jwt = "~> 1.0"

// Build for production
$ gleam build
$ gleam run
```

### 2. **Docker Deployment**

```dockerfile
FROM ghcr.io/gleam-lang/gleam:v1.0.0-erlang-alpine

WORKDIR /app
COPY . .

RUN gleam deps download
RUN gleam build

EXPOSE 8080
VOLUME ["/app/data"]

CMD ["gleam", "run"]
```

### 3. **Systemd Service**

```ini
[Unit]
Description=Books Library Backend
After=network.target

[Service]
Type=simple
User=books
WorkingDirectory=/opt/books-backend
ExecStart=/opt/books-backend/build/dev/erlang/books_backend/run
Restart=always
RestartSec=10

Environment=DATABASE_PATH=/opt/books-backend/data/books.db
Environment=SECRET_KEY_BASE=your-secret-key
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

---

## Performance Characteristics

### Erlang VM Benefits

- **Lightweight Processes**: Millions of concurrent processes
- **Fault Tolerance**: Process isolation prevents cascading failures
- **Hot Code Swapping**: Update code without stopping the server
- **Distributed**: Can easily scale to multiple nodes
- **Garbage Collection**: Per-process GC, minimal stop-the-world pauses

### SQLite Performance

- **Read Heavy Workloads**: Excellent for mostly-read applications
- **Simple Deployment**: No separate database server needed
- **ACID Compliance**: Full transaction support
- **File-based**: Easy backups and migrations
- **Limitations**: Single writer, no network access

### Expected Performance

```
Concurrent Users: 100+ (typical for self-hosted)
Requests/Second: 1000+ (for simple operations)
Memory Usage: ~10-50MB (Erlang VM + application)
Startup Time: <1 second
Database Size: ~100MB for 10,000 books with metadata
```

---

## Testing Strategy

### Unit Testing

```gleam
import gleeunit
import gleeunit/should

pub fn main() {
  gleeunit.main()
}

pub fn create_book_test() {
  let book = Book(
    id: 1,
    title: "Test Book",
    author: "Test Author",
    isbn: Some("9781234567890"),
    status: ToRead,
  )
  
  book.title
  |> should.equal("Test Book")
  
  book.isbn
  |> should.equal(Some("9781234567890"))
}

pub fn book_status_serialization_test() {
  ToRead
  |> book_status_to_string()
  |> should.equal("to_read")
  
  "reading"
  |> string_to_book_status()
  |> should.equal(Ok(Reading))
}
```

### Integration Testing

```gleam
pub fn database_integration_test() {
  // Setup test database
  let assert Ok(db) = sqlite.open(":memory:")
  let assert Ok(_) = create_books_table(db)
  
  // Test book insertion
  let book = Book(
    id: 0,
    title: "Integration Test Book",
    author: "Test Author",
    isbn: None,
    status: ToRead,
  )
  
  let assert Ok(book_id) = insert_book(db, book)
  book_id |> should.be_greater_than(0)
  
  // Test book retrieval
  let assert Ok(books) = get_all_books(db)
  books |> list.length() |> should.equal(1)
}
```

---

## Migration from Other Backends

### Data Migration Script

```gleam
import gleam/sqlite
import gleam/json
import gleam/result

pub fn migrate_from_json(json_file: String, db: sqlite.Connection) -> Result(Int, String) {
  json.read_file(json_file)
  |> result.then(json.decode_list(_, decode_book))
  |> result.then(fn(books) {
    list.try_fold(books, 0, fn(count, book) {
      insert_book(db, book)
      |> result.map(fn(_) { count + 1 })
    })
  })
}
```

---

## Development Workflow

### 1. **Setup Development Environment**

```bash
# Install Gleam
curl -fsSL https://gleam.run/install.sh | sh

# Create new project
gleam new books_backend
cd books_backend

# Add dependencies
gleam add mist gleam_sqlite gleam_json gleam_jwt
```

### 2. **Development Commands**

```bash
# Install dependencies
gleam deps download

# Run in development mode
gleam run

# Run tests
gleam test

# Format code
gleam format

# Check types
gleam check

# Build for production
gleam build
```

### 3. **Hot Reloading**

```gleam
// Development server with hot reloading
import gleam/erlang/process
import mist

pub fn start_dev_server() {
  let handler = create_handler()
  
  mist.new(handler)
  |> mist.port(8080)
  |> mist.start_http()
  
  process.sleep_forever()
}
```

---

## Pros and Cons Summary

### ✅ **Advantages**

1. **Type Safety**: Compile-time guarantees prevent many runtime errors
2. **Fault Tolerance**: Erlang VM's legendary reliability and "let it crash" philosophy
3. **Concurrency**: Actor model handles many concurrent users efficiently
4. **Simple Deployment**: Single binary + SQLite file, no external dependencies
5. **Performance**: Fast startup, low memory usage, excellent concurrency
6. **Modern Language**: Clean syntax, functional programming benefits
7. **Self-Hosted Friendly**: Perfect for single-instance deployments
8. **Future-Proof**: Growing ecosystem, active development

### ⚠️ **Considerations**

1. **Learning Curve**: Functional programming paradigm may be new
2. **Smaller Ecosystem**: Fewer libraries compared to Node.js/Python
3. **SQLite Limitations**: Single writer, not suitable for high-write workloads
4. **Community Size**: Smaller community compared to mainstream languages
5. **Debugging**: Different debugging experience than imperative languages
6. **Documentation**: Some libraries may have limited documentation

---

## Recommended Implementation Timeline

### Week 1: Setup & Foundation

- [ ] Install Gleam and setup development environment
- [ ] Create basic Mist HTTP server
- [ ] Setup SQLite database with basic schema
- [ ] Implement basic CRUD operations for books

### Week 2: Authentication & API

- [ ] Implement JWT authentication
- [ ] Add user management endpoints
- [ ] Create middleware for CORS, authentication
- [ ] Add comprehensive error handling

### Week 3: Integration & Testing

- [ ] Connect to Google Books API for metadata
- [ ] Implement comprehensive test suite
- [ ] Add database migrations
- [ ] Performance testing and optimization

### Week 4: Deployment & Polish

- [ ] Create Docker deployment setup
- [ ] Add production configuration
- [ ] Setup logging and monitoring
- [ ] Documentation and deployment guides

---

## Alternative Considerations

### If Gleam Doesn't Work Out

1. **Elixir + Phoenix**: More mature ecosystem, similar VM benefits
2. **Go + Gin**: Simple, fast, good ecosystem
3. **Rust + Axum**: Maximum performance, strong types
4. **Node.js + Fastify**: Largest ecosystem, familiar for frontend developers

### Hybrid Approach

Start with Gleam for the core API, and:

- Use Elixir libraries when needed (full interop)
- Add Node.js microservices for specific tasks (like file processing)
- Keep frontend completely decoupled

---

## Conclusion

**Gleam + Erlang VM + SQLite is an excellent choice for a self-hosted books library backend.** It offers:

- ✅ **Reliability**: Erlang VM's proven track record
- ✅ **Type Safety**: Gleam's strong type system
- ✅ **Simplicity**: Easy deployment and maintenance
- ✅ **Performance**: Great for typical self-hosted workloads
- ✅ **Future-Proof**: Modern language with growing ecosystem

This combination is particularly well-suited for:

- Self-hosted applications
- Small to medium user bases (1-1000 users)
- Applications requiring high reliability
- Developers who value type safety and functional programming

The main trade-off is a smaller ecosystem compared to mainstream languages, but for a books library application, the available libraries are more than sufficient.

---

*Research conducted: June 27, 2025*
*Next Review: September 2025 (check for new Gleam libraries and ecosystem updates)*

---

## Gleam-Vue Integration Research

### Frontend-Backend Communication Architecture

**Gleam Backend** ↔ **HTTP/JSON API** ↔ **Vue 3 Frontend**

The integration between Gleam and Vue follows a standard REST API architecture where:

- **Gleam (Backend)**: Provides HTTP endpoints serving JSON responses
- **Vue 3 (Frontend)**: Consumes the API using fetch/composables

---

### Gleam API Server Setup for Vue Integration

#### 1. **JSON API Response Structure**

```gleam
// api/response.gleam
import gleam/json
import gleam/http/response.{Response}

pub type ApiResponse(data) {
  Success(data: data)
  Error(message: String, code: Int)
}

pub fn json_success(data: json.Json) -> Response(String) {
  json.object([
    #("success", json.bool(True)),
    #("data", data),
    #("timestamp", json.string(current_timestamp()))
  ])
  |> json.to_string
  |> response.new(200)
  |> response.set_header("content-type", "application/json")
  |> response.set_header("access-control-allow-origin", "*")
}

pub fn json_error(message: String, status: Int) -> Response(String) {
  json.object([
    #("success", json.bool(False)),
    #("error", json.string(message)),
    #("code", json.int(status)),
    #("timestamp", json.string(current_timestamp()))
  ])
  |> json.to_string
  |> response.new(status)
  |> response.set_header("content-type", "application/json")
  |> response.set_header("access-control-allow-origin", "*")
}
```

#### 2. **CORS Configuration for Vue Development**

```gleam
// middleware/cors.gleam
import wisp.{Request, Response}

pub fn cors_middleware(req: Request, handler: fn() -> Response) -> Response {
  let response = handler()
  
  response
  |> response.set_header("access-control-allow-origin", "*")
  |> response.set_header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
  |> response.set_header("access-control-allow-headers", "content-type, authorization")
  |> response.set_header("access-control-max-age", "86400")
}

pub fn handle_preflight(req: Request) -> Response {
  case request.method(req) {
    http.Options -> 
      response.new(204)
      |> cors_middleware(req, fn() { response.new(204) })
    _ -> response.new(405)
  }
}
```

#### 3. **Books API Endpoints for Vue**

```gleam
// handlers/books.gleam
import my_app/models/book.{Book}
import my_app/database/books as books_db
import my_app/api/response
import wisp.{Request, Response}
import gleam/json
import gleam/result
import gleam/int

pub fn handle_books_request(req: Request, ctx: Context) -> Response {
  case request.method(req), request.path_segments(req) {
    // GET /api/books - List all books
    http.Get, ["api", "books"] -> get_books(req, ctx)
    
    // POST /api/books - Create new book
    http.Post, ["api", "books"] -> create_book(req, ctx)
    
    // GET /api/books/:id - Get specific book
    http.Get, ["api", "books", id] -> get_book(req, ctx, id)
    
    // PUT /api/books/:id - Update book
    http.Put, ["api", "books", id] -> update_book(req, ctx, id)
    
    // DELETE /api/books/:id - Delete book
    http.Delete, ["api", "books", id] -> delete_book(req, ctx, id)
    
    _, _ -> response.json_error("Not Found", 404)
  }
}

fn get_books(req: Request, ctx: Context) -> Response {
  case books_db.get_all_books(ctx.db) {
    Ok(books) -> 
      books
      |> list.map(book.to_json)
      |> json.array
      |> response.json_success
    Error(_) -> response.json_error("Failed to fetch books", 500)
  }
}

fn create_book(req: Request, ctx: Context) -> Response {
  use json <- wisp.require_json(req)
  
  case book.from_json(json) {
    Ok(book_data) -> 
      case books_db.insert_book(ctx.db, book_data) {
        Ok(book) -> 
          book.to_json(book)
          |> response.json_success
        Error(_) -> response.json_error("Failed to create book", 500)
      }
    Error(_) -> response.json_error("Invalid book data", 400)
  }
}
```

---

### Vue 3 Integration Patterns

#### 1. **HTTP Client Composable**

```typescript
// src/composables/useApi.ts
import { ref, type Ref } from 'vue'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: number
  timestamp: string
}

export function useApi() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  
  async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${baseURL}/api${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }
    
    try {
      const response = await fetch(url, defaultOptions)
      const data: ApiResponse<T> = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
  
  return {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint),
    post: <T>(endpoint: string, data: any) => 
      apiRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    put: <T>(endpoint: string, data: any) => 
      apiRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: <T>(endpoint: string) => 
      apiRequest<T>(endpoint, { method: 'DELETE' }),
  }
}
```

#### 2. **Books Data Composable**

```typescript
// src/composables/useBooks.ts
import { ref, reactive } from 'vue'
import { useApi } from './useApi'

export interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  status: 'to_read' | 'reading' | 'completed'
  created_at: string
  updated_at: string
}

export function useBooks() {
  const { get, post, put, delete: del } = useApi()
  
  const books = ref<Book[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  async function fetchBooks() {
    loading.value = true
    error.value = null
    
    try {
      const response = await get<Book[]>('/books')
      books.value = response.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch books'
    } finally {
      loading.value = false
    }
  }
  
  async function createBook(bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await post<Book>('/books', bookData)
      if (response.data) {
        books.value.push(response.data)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create book'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateBook(id: number, bookData: Partial<Book>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await put<Book>(`/books/${id}`, bookData)
      if (response.data) {
        const index = books.value.findIndex(book => book.id === id)
        if (index !== -1) {
          books.value[index] = response.data
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update book'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteBook(id: number) {
    loading.value = true
    error.value = null
    
    try {
      await del(`/books/${id}`)
      books.value = books.value.filter(book => book.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete book'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  }
}
```

#### 3. **Vue Component Integration**

```vue
<!-- src/views/LibraryView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBooks, type Book } from '@/composables/useBooks'
import UiButton from '@/components/ui/UiButton.vue'
import Card from '@/components/ui/Card.vue'

const { books, loading, error, fetchBooks, createBook, updateBook, deleteBook } = useBooks()

const newBook = ref<Partial<Book>>({
  title: '',
  author: '',
  isbn: '',
  status: 'to_read'
})

onMounted(() => {
  fetchBooks()
})

async function handleCreateBook() {
  if (!newBook.value.title || !newBook.value.author) return
  
  try {
    await createBook(newBook.value as Omit<Book, 'id' | 'created_at' | 'updated_at'>)
    newBook.value = { title: '', author: '', isbn: '', status: 'to_read' }
  } catch (err) {
    console.error('Failed to create book:', err)
  }
}

async function handleUpdateStatus(book: Book, newStatus: Book['status']) {
  try {
    await updateBook(book.id, { status: newStatus })
  } catch (err) {
    console.error('Failed to update book:', err)
  }
}

async function handleDeleteBook(id: number) {
  if (confirm('Are you sure you want to delete this book?')) {
    try {
      await deleteBook(id)
    } catch (err) {
      console.error('Failed to delete book:', err)
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">My Library</h1>
      <Button @click="fetchBooks" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </Button>
    </div>
    
    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-700">{{ error }}</p>
    </div>
    
    <!-- Add Book Form -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">Add New Book</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          v-model="newBook.title"
          placeholder="Book title"
          class="border border-gray-300 rounded-md p-2"
        />
        <input
          v-model="newBook.author"
          placeholder="Author"
          class="border border-gray-300 rounded-md p-2"
        />
        <input
          v-model="newBook.isbn"
          placeholder="ISBN (optional)"
          class="border border-gray-300 rounded-md p-2"
        />
        <select v-model="newBook.status" class="border border-gray-300 rounded-md p-2">
          <option value="to_read">To Read</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <Button @click="handleCreateBook" class="mt-4" :disabled="loading">
        Add Book
      </Button>
    </Card>
    
    <!-- Books List -->
    <div v-if="loading" class="text-center py-8">
      <p>Loading books...</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="book in books" :key="book.id" class="p-6">
        <div class="space-y-3">
          <h3 class="text-lg font-semibold">{{ book.title }}</h3>
          <p class="text-gray-600">by {{ book.author }}</p>
          <p v-if="book.isbn" class="text-sm text-gray-500">ISBN: {{ book.isbn }}</p>
          
          <div class="flex items-center justify-between">
            <select
              :value="book.status"
              @change="handleUpdateStatus(book, ($event.target as HTMLSelectElement).value as Book['status'])"
              class="border border-gray-300 rounded-md p-1 text-sm"
            >
              <option value="to_read">To Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>
            
            <Button
              @click="handleDeleteBook(book.id)"
              variant="destructive"
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
    
    <div v-if="!loading && books.length === 0" class="text-center py-8">
      <p class="text-gray-500">No books in your library yet.</p>
    </div>
  </div>
</template>
```

---

### Environment Configuration

#### 1. **Gleam Server Configuration**

```gleam
// config/env.gleam
import gleam/os

pub type Config {
  Config(
    port: Int,
    database_path: String,
    cors_origin: String,
    log_level: String,
  )
}

pub fn load_config() -> Config {
  Config(
    port: get_env_int("PORT", 8080),
    database_path: get_env_string("DATABASE_PATH", "./books.db"),
    cors_origin: get_env_string("CORS_ORIGIN", "*"),
    log_level: get_env_string("LOG_LEVEL", "info"),
  )
}

fn get_env_string(key: String, default: String) -> String {
  os.get_env(key)
  |> result.unwrap(default)
}

fn get_env_int(key: String, default: Int) -> Int {
  os.get_env(key)
  |> result.then(int.parse)
  |> result.unwrap(default)
}
```

#### 2. **Vue Environment Variables**

```bash
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://your-production-domain.com
```

---

### Frontend-Backend Development Workflow

#### 1. **Concurrent Development Setup**

```json
// package.json (Vue project)
{
  "scripts": {
    "dev": "vite",
    "dev:full": "concurrently \"npm run dev\" \"npm run backend\"",
    "backend": "cd ../books-backend-gleam && gleam run",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

#### 2. **Vite Proxy Configuration**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

---

### Integration Benefits

#### ✅ **Type Safety End-to-End**

- **Gleam**: Compile-time type checking for backend logic
- **Vue + TypeScript**: Type-safe frontend with interface definitions
- **JSON Schema**: Consistent data structures between frontend/backend

#### ✅ **Development Experience**

- **Hot Reloading**: Both Gleam and Vue support live development
- **Error Handling**: Graceful error propagation from Gleam to Vue
- **API Documentation**: Self-documenting through type definitions

#### ✅ **Performance**

- **Gleam**: Fast HTTP responses with Erlang VM concurrency
- **Vue**: Reactive UI updates with minimal re-renders
- **JSON**: Lightweight data transfer format

#### ✅ **Scalability**

- **Gleam**: Actor model scales with user load
- **Vue**: Component-based architecture scales with UI complexity
- **REST API**: Standard HTTP semantics for caching and CDNs

---

### Common Integration Patterns

#### 1. **Real-time Updates (Optional)**

```gleam
// For future WebSocket integration
import mist/websocket

pub fn handle_websocket(req: Request) -> Response {
  websocket.upgrade(req, handle_ws_message, handle_ws_close)
}

fn handle_ws_message(message: String) -> Nil {
  // Broadcast book updates to connected clients
  broadcast_book_update(message)
}
```

```typescript
// Vue WebSocket composable
export function useWebSocket() {
  const ws = new WebSocket('ws://localhost:8080/ws')
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data)
    // Handle real-time book updates
  }
}
```

#### 2. **Authentication Integration**

```gleam
// JWT middleware
pub fn require_auth(req: Request, handler: fn(User) -> Response) -> Response {
  case get_auth_header(req) {
    Ok(token) -> 
      case verify_jwt(token) {
        Ok(user) -> handler(user)
        Error(_) -> json_error("Unauthorized", 401)
      }
    Error(_) -> json_error("Missing authorization", 401)
  }
}
```

```typescript
// Vue auth composable
export function useAuth() {
  const token = ref(localStorage.getItem('auth_token'))
  
  const api = useApi()
  
  // Add auth header to all requests
  api.defaults.headers.Authorization = `Bearer ${token.value}`
}
```

---

### Full-Stack Testing

#### 1. **Gleam API Tests**

```gleam
import gleeunit/should

pub fn create_book_test() {
  let request = test_request(
    method: http.Post,
    path: "/api/books",
    body: book_json()
  )
  
  let response = handle_books_request(request, test_context())
  
  response.status |> should.equal(201)
  response.body |> should.contain("\"success\":true")
}
```

#### 2. **Vue Component Tests**

```typescript
// tests/LibraryView.test.ts
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import LibraryView from '@/views/LibraryView.vue'

// Mock the API composable
vi.mock('@/composables/useBooks', () => ({
  useBooks: () => ({
    books: ref([]),
    loading: ref(false),
    error: ref(null),
    fetchBooks: vi.fn(),
  })
}))

test('renders library view', () => {
  const wrapper = mount(LibraryView)
  expect(wrapper.text()).toContain('My Library')
})
```

---

*Integration research completed: June 27, 2025*
*Covers: HTTP API design, CORS setup, Vue composables, TypeScript integration, development workflow*
