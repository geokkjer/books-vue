# Gleam Development Reference - 2025 Edition

**⚠️ IMPORTANT**: This document contains the latest Gleam patterns and APIs as of June 2025. **Always reference this document when doing Gleam development** as the language evolves rapidly and many online tutorials may be outdated.

## Core Language Changes & Modern Patterns

### 1. **Package Dependencies** 
**⚠️ CRITICAL**: Always use `gleam add <package>` instead of manually editing `gleam.toml`:

```bash
# ✅ Correct way
gleam add wisp
gleam add gleam_json
gleam add sqlight

# ❌ Never manually edit gleam.toml dependencies
```

### 2. **Modern Use Expression Syntax**
```gleam
// ✅ Modern pattern (no variable binding in use)
pub fn handle_request(req: wisp.Request) -> wisp.Response {
  use <- wisp.log_request(req)
  use <- wisp.serve_static(req, under: "/static", from: "/public")
  
  // Handle routing
  wisp.ok()
}
```

### 3. **HTTP Methods and Imports**
```gleam
import gleam/http  // Use gleam/http for HTTP methods
import wisp

pub fn handle_method(req: wisp.Request) -> wisp.Response {
  case req.method {
    http.Get -> get_handler(req)
    http.Post -> post_handler(req)
    _ -> wisp.method_not_allowed([http.Get, http.Post])
  }
}
```

### 4. **String Tree for Responses**
All Wisp responses now require `string_tree.StringTree`:

```gleam
import gleam/string_tree

// ✅ Correct JSON response
fn json_response() -> wisp.Response {
  let json = string_tree.from_string(
    "{\"message\": \"Hello, world!\"}"
  )
  wisp.json_response(json, 200)
}

// ✅ Correct HTML response
fn html_response() -> wisp.Response {
  let html = string_tree.from_string("
    <!DOCTYPE html>
    <html><body><h1>Hello</h1></body></html>
  ")
  wisp.html_response(html, 200)
}
```

## Wisp Web Framework - Latest Patterns

### 1. **Modern Server Setup with Mist**
```gleam
import wisp
import wisp/wisp_mist
import mist

pub fn main() {
  wisp.configure_logger()
  
  let secret_key_base = wisp.random_string(64)
  
  let assert Ok(_) =
    handle_request
    |> wisp_mist.handler(secret_key_base)
    |> mist.new
    |> mist.port(8080)
    |> mist.start_http
    
  io.println("🚀 Server started on http://localhost:8080")
}
```

### 2. **Request Routing Patterns**
```gleam
pub fn handle_request(req: wisp.Request) -> wisp.Response {
  use <- wisp.log_request(req)
  
  case wisp.path_segments(req) {
    [] -> home_page(req)
    ["api", "health"] -> health_check(req)
    ["api", "books"] -> books_handler(req)
    ["api", "books", id] -> book_detail_handler(req, id)
    _ -> wisp.not_found()
  }
}
```

### 3. **JSON Handling**
```gleam
import gleam/json
import gleam/dynamic/decode

// Parse JSON from request
pub fn create_book(req: wisp.Request) -> wisp.Response {
  use json <- wisp.require_json(req)
  
  let result = {
    use title <- decode.field("title", decode.string)
    use author <- decode.field("author", decode.string)
    decode.success(Book(title: title, author: author))
  }(json)
  
  case result {
    Ok(book) -> {
      // Process book...
      let response = string_tree.from_string(
        json.to_string(book_to_json(book))
      )
      wisp.json_response(response, 201)
    }
    Error(_) -> wisp.bad_request()
  }
}
```

### 4. **Error Handling & Responses**
```gleam
// Standard response patterns
pub fn not_found() -> wisp.Response {
  wisp.not_found()
}

pub fn bad_request() -> wisp.Response {
  wisp.bad_request()
}

pub fn internal_server_error() -> wisp.Response {
  wisp.internal_server_error()
}

// Custom JSON error
pub fn error_response(message: String, code: Int) -> wisp.Response {
  let json = string_tree.from_string(
    "{\"error\": \"" <> message <> "\"}"
  )
  wisp.json_response(json, code)
}
```

## Database Integration with SQLight

### 1. **Modern Connection Setup**
```gleam
import sqlight

pub type Context {
  Context(db: sqlight.Connection)
}

pub fn setup_database() -> Context {
  let assert Ok(db) = sqlight.open("./data/library.db")
  
  // Create tables if they don't exist
  let assert Ok(_) = sqlight.exec(
    "CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      status TEXT DEFAULT 'available'
    )",
    db
  )
  
  Context(db: db)
}
```

### 2. **Database Queries**
```gleam
import sqlight

pub fn get_all_books(db: sqlight.Connection) -> List(Book) {
  let sql = "SELECT id, title, author, isbn, status FROM books"
  
  case sqlight.query(sql, db, [], book_decoder) {
    Ok(books) -> books
    Error(_) -> []
  }
}

pub fn book_decoder(row: sqlight.Row) -> Book {
  let assert Ok(id) = sqlight.get_int(row, "id")
  let assert Ok(title) = sqlight.get_string(row, "title")
  let assert Ok(author) = sqlight.get_string(row, "author")
  let assert Ok(isbn) = sqlight.get_string(row, "isbn")
  let assert Ok(status) = sqlight.get_string(row, "status")
  
  Book(
    id: id,
    title: title,
    author: author,
    isbn: isbn,
    status: status
  )
}
```

## Testing Patterns

### 1. **Basic Test Structure**
```gleam
import gleeunit
import gleeunit/should

pub fn main() {
  gleeunit.main()
}

pub fn book_creation_test() {
  let book = Book(
    id: 1,
    title: "Test Book",
    author: "Test Author",
    isbn: "123456789",
    status: "available"
  )
  
  book.title
  |> should.equal("Test Book")
}

pub fn http_endpoint_test() {
  let req = test_request(http.Get, "/api/books")
  let response = handle_request(req)
  
  response.status
  |> should.equal(200)
}
```

### 2. **Testing with Assertions**
```gleam
pub fn validation_test() {
  // Modern assertion syntax
  assert result.is_ok(validate_book(valid_book))
  assert result.is_error(validate_book(invalid_book))
  assert book.title == "Expected Title"
}
```

## Pattern Matching & Types

### 1. **Modern Pattern Matching**
```gleam
// Using shorthand labels
pub fn process_result(result: Result(Book, String)) {
  case result {
    Ok(book) -> handle_book(book)
    Error(message) -> log_error(message)
  }
}

// Pattern matching with labels
pub type Book {
  Book(id: Int, title: String, author: String, isbn: String, status: String)
}

pub fn update_book_status(book: Book, new_status: String) -> Book {
  // Modern record update syntax
  Book(..book, status: new_status)
}
```

### 2. **Using `use` for Clean Error Handling**
```gleam
pub fn create_book_handler(req: wisp.Request, ctx: Context) -> wisp.Response {
  use json <- wisp.require_json(req)
  use book_data <- result.try(parse_book_json(json))
  use book <- result.try(validate_book(book_data))
  use saved_book <- result.try(save_book(book, ctx.db))
  
  let response = string_tree.from_string(
    json.to_string(book_to_json(saved_book))
  )
  wisp.json_response(response, 201)
}
```

## Common Dependencies for Web Apps

```toml
# Add these with: gleam add <package>
[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
wisp = ">= 1.8.0 and < 2.0.0"           # Web framework
gleam_json = ">= 3.0.1 and < 4.0.0"     # JSON handling
sqlight = ">= 1.0.1 and < 2.0.0"        # SQLite database
mist = ">= 5.0.1 and < 6.0.0"           # HTTP server
cors_builder = ">= 2.0.5 and < 3.0.0"   # CORS support

[dev-dependencies]
gleeunit = ">= 1.0.0 and < 2.0.0"       # Testing framework
```

## Environment & Development

### 1. **Project Structure**
```
project/
├── src/
│   ├── app.gleam              # Main entry point
│   ├── app/
│   │   ├── web.gleam          # Middleware & context
│   │   ├── router.gleam       # Request routing
│   │   ├── models/
│   │   │   └── book.gleam     # Data models
│   │   ├── handlers/
│   │   │   └── books.gleam    # Route handlers
│   │   └── database.gleam     # Database operations
├── test/
│   └── app_test.gleam
├── gleam.toml
└── data/
    └── library.db
```

### 2. **Development Commands**
```bash
# Project setup
gleam new my_project
cd my_project

# Add dependencies
gleam add wisp
gleam add gleam_json
gleam add sqlight

# Development
gleam run                # Start the application
gleam test              # Run tests
gleam build             # Build without running
gleam format            # Format code
gleam check             # Type check without building

# Specific module
gleam run -m app/server  # Run specific module
```

## Debugging & Development Tools

### 1. **Echo for Debug Printing** (New in 2025)
```gleam
pub fn debug_pipeline() {
  [1, 2, 3]
  |> echo                           // Prints: [1, 2, 3]
  |> list.map(fn(x) { x * 2 })
  |> echo                           // Prints: [2, 4, 6]
  |> list.sum
}
```

### 2. **Modern Error Messages**
Gleam now provides much better error messages. Common patterns:

```gleam
// Type mismatch suggestions
pub fn result_wrapper() -> Result(String, Nil) {
  "Hello!"  // Compiler suggests: Did you mean to wrap this in an `Ok`?
}

// Import suggestions
pub fn main() {
  io.println("Hello")  // Suggests: import gleam/io
}
```

## Key Changes from Older Tutorials

1. **Use `gleam add`** instead of manual `gleam.toml` editing
2. **Use `string_tree.StringTree`** for all HTTP responses
3. **Use `gleam/http`** for HTTP methods, not `wisp.Get`
4. **Use `use <-`** without variable binding for middleware
5. **Mist integration** replaces older HTTP server patterns
6. **Modern `assert`** keyword for boolean testing
7. **`echo`** keyword for debugging
8. **Improved pattern matching** with shorthand labels

## Quick Reference Card

```gleam
// ✅ Modern Gleam web app template
import gleam/io
import gleam/http
import gleam/string_tree
import wisp
import wisp/wisp_mist
import mist

pub fn main() {
  wisp.configure_logger()
  
  let secret_key_base = wisp.random_string(64)
  let assert Ok(_) =
    handle_request
    |> wisp_mist.handler(secret_key_base)
    |> mist.new
    |> mist.port(8080)
    |> mist.start_http
    
  io.println("🚀 Server running on http://localhost:8080")
}

pub fn handle_request(req: wisp.Request) -> wisp.Response {
  use <- wisp.log_request(req)
  
  case wisp.path_segments(req), req.method {
    [], http.Get -> home_page()
    ["api", "health"], http.Get -> health_check()
    _, _ -> wisp.not_found()
  }
}

pub fn home_page() -> wisp.Response {
  let html = string_tree.from_string("<h1>Hello, Gleam!</h1>")
  wisp.html_response(html, 200)
}

pub fn health_check() -> wisp.Response {
  let json = string_tree.from_string("{\"status\": \"ok\"}")
  wisp.json_response(json, 200)
}
```

---

**Remember**: This document reflects Gleam as of June 2025. The language evolves rapidly, so always verify with the latest official documentation for any breaking changes beyond this date.
