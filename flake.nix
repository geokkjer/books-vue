{
  description = "Books Library App - Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};

      # Gleam packages
      gleam = pkgs.gleam;
      erlang = pkgs.erlang_27;
      rebar3 = pkgs.rebar3;

      # Node.js for frontend
      nodejs = pkgs.nodejs_22;

      # Database
      sqlite = pkgs.sqlite;

      # Development tools
      git = pkgs.git;
      curl = pkgs.curl;
      jq = pkgs.jq;
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          # Backend development
          gleam
          erlang
          rebar3

          # Frontend development
          nodejs

          # Database
          sqlite

          # Development tools
          git
          curl
          jq
        ];

        shellHook = ''
          echo "📚 Books Library Development Environment"
          echo ""
          echo "🟢 Available tools:"
          echo "  - Gleam: $(gleam --version 2>/dev/null || echo 'checking...')"
          echo "  - Erlang: $(erl -eval 'io:format("~s~n", [erlang:system_info(otp_release)]), halt().' -noshell)"
          echo "  - Node.js: $(node --version)"
          echo "  - SQLite: $(sqlite3 --version | cut -d' ' -f1)"
          echo ""
          echo "📁 Project structure:"
          echo "  - Frontend: Vue 3 + Tailwind (src/)"
          echo "  - Backend: Gleam + Mist (backend/)"
          echo ""
          echo "🚀 Quick start:"
          echo "  - Frontend dev: npm run dev"
          echo "  - Backend setup: cd backend && gleam run"
          echo ""

          # Set up environment variables
          export GLEAM_PATH="$PWD/backend"
          export NODE_ENV="development"
          export SQLITE_DB_PATH="$PWD/data/library.db"

          # Create data directory if it doesn't exist
          mkdir -p data
        '';

        # Environment variables
        GLEAM_PATH = "./backend";
        NODE_ENV = "development";
        SQLITE_DB_PATH = "./data/library.db";
      };

      # Make tools available for nix run
      packages = {
        gleam = gleam;
        nodejs = nodejs;
        sqlite = sqlite;
      };
    });
}
