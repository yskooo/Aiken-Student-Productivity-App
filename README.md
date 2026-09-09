# Aiken Student Productivity App

Aiken is a student productivity app with an Expo mobile client, an API server, and a browser-based mockup sandbox.

## Prerequisites

- Node.js 20 or newer. Node.js 24 is the recommended version for the project.
- pnpm 10 or newer.
- PostgreSQL, only if you need to work with the database or run database schema commands.
- Expo Go on a phone, Android Studio, or an iOS simulator if you want to run the mobile app locally.

Check your versions:

```powershell
node --version
pnpm --version
```

## First-time setup

Clone the repository and open a terminal in the repository root, the folder containing `package.json`.

```powershell
git clone <repository-url>
cd Aiken-Student-Productivity-App
pnpm install
```

Do not use `npm install` or `yarn install`; this repository is configured as a pnpm workspace.

## Run the browser mockup

The mockup sandbox is the easiest way to view the current interface in a browser. It requires `PORT` and `BASE_PATH`.

```powershell
$env:PORT = "5173"
$env:BASE_PATH = "/"
pnpm --filter @workspace/mockup-sandbox dev
```

Open http://localhost:5173 in a browser. Stop the server with `Ctrl+C`.

To run the same command from Command Prompt instead of PowerShell:

```bat
set PORT=5173 && set BASE_PATH=/ && pnpm --filter @workspace/mockup-sandbox dev
```

## Run the API server

The API server requires an explicit port and exposes a health check at `/api/healthz`.

```powershell
$env:PORT = "5000"
pnpm --filter @workspace/api-server dev
```

Verify it is running by opening http://localhost:5000/api/healthz. A healthy response is:

```json
{"status":"ok"}
```

## Run the mobile app

Start Expo from the repository root:

```powershell
pnpm --filter @workspace/aiken-mobile dev
```

Then use the options shown by Expo to open the app in Expo Go, an Android emulator, an iOS simulator, or a web browser. For a physical phone, make sure the phone and computer are on the same network. If the QR code cannot be reached, start Expo with tunnel mode:

```powershell
pnpm --filter @workspace/aiken-mobile exec expo start --tunnel
```

## Database setup (optional)

Database work requires a PostgreSQL connection string in `DATABASE_URL`. Set it for the current PowerShell session:

```powershell
$env:DATABASE_URL = "postgresql://username:password@localhost:5432/aiken"
```

Push the current Drizzle schema to the database:

```powershell
pnpm --filter @workspace/db push
```

The API does not need `DATABASE_URL` just to start its current health endpoint, but database-backed features and schema commands do.

## Useful checks and builds

Run these from the repository root:

```powershell
# Typecheck libraries and workspace packages
pnpm run typecheck

# Typecheck and build all packages that provide a build script
pnpm run build

# Typecheck one package
pnpm --filter @workspace/aiken-mobile typecheck
pnpm --filter @workspace/mockup-sandbox typecheck
pnpm --filter @workspace/api-server typecheck
```

If the OpenAPI contract changes, regenerate the API client and Zod schemas:

```powershell
pnpm --filter @workspace/api-spec codegen
```

## Project layout

```text
artifacts/aiken-mobile/      Expo mobile application
artifacts/api-server/        Express API server
artifacts/mockup-sandbox/    Vite browser mockup
lib/api-spec/                OpenAPI contract and code generation
lib/api-client-react/        Generated React API client
lib/api-zod/                 Generated Zod API schemas
lib/db/                      Drizzle schema and database access
```

## Troubleshooting

- `PORT environment variable is required`: set `$env:PORT` in the same terminal before starting the API or mockup.
- `BASE_PATH environment variable is required`: set `$env:BASE_PATH = "/"` before starting the mockup.
- `DATABASE_URL must be set`: set `DATABASE_URL` before running database commands or database-backed code.
- Expo cannot connect to a phone: confirm both devices are on the same network, then retry with `--tunnel`.
- Dependencies look corrupted: remove `node_modules` and run `pnpm install` again. Keep `pnpm-lock.yaml` and do not generate a separate npm or Yarn lockfile.