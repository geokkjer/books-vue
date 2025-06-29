# Development Environment Setup

This project uses **Nix flakes** and **direnv** for a reproducible, isolated development environment. This ensures all team members work with the exact same tool versions and dependencies.

## Quick Start

If you have Nix and direnv already installed:

```bash
# Clone and enter the project
cd books-vue

# Allow direnv to load the environment (first time only)
direnv allow

# The environment will automatically load with all required tools
```

## Prerequisites

### 1. Install Nix (if not already installed)

```bash
# Install Nix with flakes support
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install

# Source the Nix profile
source /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
```

### 2. Install direnv (if not already installed)

```bash
# Using Nix
nix profile install nixpkgs#direnv

# Or using your package manager
# Ubuntu/Debian: sudo apt install direnv
# macOS: brew install direnv
```

### 3. Configure direnv for your shell

Add this to your shell configuration file (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
eval "$(direnv hook bash)"  # For bash
eval "$(direnv hook zsh)"   # For zsh
```

## Environment Details

### Included Tools

The development environment provides:

- **Gleam** - Backend language and build tool
- **Erlang 27** - Runtime for Gleam applications
- **Node.js 22** - Frontend development and build tools
- **SQLite** - Database for development and production
- **rebar3** - Erlang build tool (used by Gleam)
- **Git, curl, jq** - Essential development utilities

### Environment Variables

When the environment loads, these variables are automatically set:

- `PROJECT_ROOT` - Project root directory
- `FRONTEND_DIR` - Vue.js frontend source (`src/`)
- `BACKEND_DIR` - Gleam backend source (`backend/`)
- `DATA_DIR` - Database and data files (`data/`)
- `SQLITE_DB_PATH` - SQLite database file path
- `DATABASE_URL` - Database connection string
- `VITE_API_BASE_URL` - Frontend API endpoint
- `NODE_ENV` - Development mode
- `GLEAM_LOG_LEVEL` - Backend logging level

### Directory Structure

The environment automatically creates:

```text
books-vue/
├── src/          # Vue.js frontend
├── backend/      # Gleam backend (created when needed)
├── data/         # SQLite database and files
├── flake.nix     # Nix environment definition
├── .envrc        # direnv configuration
└── ...
```

## Usage

### First Time Setup

1. **Allow direnv**: When you first enter the project directory, run:

   ```bash
   direnv allow
   ```

2. **Verify tools**: Check that all tools are available:

   ```bash
   gleam --version
   node --version
   sqlite3 --version
   ```

### Daily Development

1. **Automatic loading**: When you `cd` into the project, the environment loads automatically

2. **Frontend development**:

   ```bash
   npm install      # Install dependencies
   npm run dev      # Start development server
   ```

3. **Backend development** (after Gleam project setup):

   ```bash
   cd backend
   gleam run        # Run the backend server
   gleam test       # Run tests
   ```

### Environment Management

- **Reload environment**: If you change `.envrc`:

  ```bash
  direnv reload
  ```

- **Check environment status**:

  ```bash
  direnv status
  ```

- **Manual environment loading** (if direnv isn't working):

  ```bash
  nix develop
  ```

## Benefits

### For Development

- **Consistency**: All developers use identical tool versions
- **Isolation**: Project dependencies don't conflict with system packages
- **Reproducibility**: Environment can be recreated exactly on any machine
- **Zero installation**: No need to manually install Gleam, Erlang, or specific Node.js versions

### For Deployment

- **Matching environments**: Production can use the same Nix expressions
- **Dependency tracking**: All dependencies are explicitly declared
- **Rollback capability**: Can easily switch between environment versions

## Troubleshooting

### direnv not loading

1. Check if direnv hook is in your shell config:

   ```bash
   echo $SHELL
   grep direnv ~/.zshrc  # or ~/.bashrc
   ```

2. Restart your shell or source the config:

   ```bash
   source ~/.zshrc
   ```

### Nix flakes not working

1. Ensure flakes are enabled in your Nix configuration:

   ```bash
   echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
   ```

2. Check Nix version (needs 2.4+):

   ```bash
   nix --version
   ```

### Tool not found

1. Check if the environment loaded:

   ```bash
   direnv status
   echo $PROJECT_ROOT
   ```

2. Manually reload:

   ```bash
   direnv reload
   ```

3. Enter Nix shell manually:

   ```bash
   nix develop
   ```

## Updating the Environment

To add new tools or change versions:

1. Edit `flake.nix` to add/modify packages
2. Run `direnv reload` to apply changes
3. Commit the changes to share with the team

Example - adding a new tool:

```nix
buildInputs = [
  # ... existing tools ...
  pkgs.htop  # Add htop to the environment
];
```

## Next Steps

Once the environment is working:

1. Initialize the Gleam backend project
2. Set up the database schema
3. Implement the REST API
4. Connect the Vue.js frontend to the backend

The environment is now ready for full-stack development! 🚀
