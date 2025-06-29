import gleam/io
import gleam/string_tree
import gleam/http
import wisp
import wisp/wisp_mist
import mist

pub fn main() {
  // Set up logging
  wisp.configure_logger()
  
  // Create the request handler
  let handler = handle_request
  
  // Configure the application
  let secret_key_base = wisp.random_string(64)
  
  // Start the server
  let assert Ok(_) =
    handler
    |> wisp_mist.handler(secret_key_base)
    |> mist.new
    |> mist.port(8080)
    |> mist.start
  
  io.println("🚀 Books API server started on http://localhost:8080")
}

fn handle_request(req: wisp.Request) -> wisp.Response {
  use <- wisp.log_request(req)
  
  case wisp.path_segments(req) {
    [] -> home_page(req)
    ["api", "health"] -> health_check(req)
    ["api", "books"] -> books_handler(req)
    _ -> wisp.not_found()
  }
}

fn home_page(_req: wisp.Request) -> wisp.Response {
  let html = string_tree.from_string("
    <!DOCTYPE html>
    <html>
      <head>
        <title>Books Library API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; margin-bottom: 20px; }
          .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }
          .method { font-weight: bold; color: #007bff; }
          pre { background: #e9ecef; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class='container'>
          <h1>📚 Books Library API</h1>
          <p>Self-hosted books library backend built with Gleam and Wisp</p>
          
          <h2>Available Endpoints:</h2>
          
          <div class='endpoint'>
            <div class='method'>GET /api/health</div>
            <p>Check API health status</p>
          </div>
          
          <div class='endpoint'>
            <div class='method'>GET /api/books</div>
            <p>Get all books in the library</p>
          </div>
          
          <h2>Example Usage:</h2>
          <pre>curl http://localhost:8080/api/health</pre>
          <pre>curl http://localhost:8080/api/books</pre>
        </div>
      </body>
    </html>
  ")
  
  wisp.html_response(html, 200)
}

fn health_check(_req: wisp.Request) -> wisp.Response {
  let json = string_tree.from_string(
    "{\"status\": \"ok\", \"service\": \"books-api\", \"version\": \"1.0.0\"}"
  )
  wisp.json_response(json, 200)
}

fn books_handler(req: wisp.Request) -> wisp.Response {
  case req.method {
    http.Get -> get_books(req)
    http.Post -> create_book(req)
    _ -> wisp.method_not_allowed([http.Get, http.Post])
  }
}

fn get_books(_req: wisp.Request) -> wisp.Response {
  // TODO: Implement database query
  let books_json = string_tree.from_string("
    {
      \"books\": [
        {
          \"id\": 1,
          \"title\": \"The Pragmatic Programmer\",
          \"author\": \"David Thomas, Andrew Hunt\",
          \"isbn\": \"978-0201616224\",
          \"status\": \"available\"
        },
        {
          \"id\": 2,
          \"title\": \"Clean Code\",
          \"author\": \"Robert C. Martin\",
          \"isbn\": \"978-0132350884\",
          \"status\": \"available\"
        }
      ],
      \"total\": 2
    }
  ")
  
  wisp.json_response(books_json, 200)
}

fn create_book(_req: wisp.Request) -> wisp.Response {
  // TODO: Implement book creation
  let json = string_tree.from_string(
    "{\"message\": \"Book creation endpoint - not yet implemented\", \"status\": \"todo\"}"
  )
  wisp.json_response(json, 501)
}
