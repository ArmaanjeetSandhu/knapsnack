# For me only

## Setup

1. **Install server dependencies**

   ```bash
   uv venv
   source .venv/bin/activate
   uv sync --frozen
   ```

2. **Install client dependencies**

   ```bash
   cd client
   pnpm install --frozen-lockfile
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root and add the required environment variables.

## Running

Open two terminal windows:

**Terminal 1:**

```bash
make dev
```

**Terminal 2:**

```bash
cd client
pnpm dev
```

## Deploying to Vercel

Pushing to `main` triggers a production deploy automatically. To deploy manually:

```bash
vercel --prod
```

### Dependencies

Vercel detects `uv.lock` and installs with `uv sync`, so the lockfile is the single
source of truth. Nothing needs regenerating -- just commit `uv.lock` as usual.

`.python-version` is pinned to `3.12` (minor only, not a patch version) because uv
drops older patch releases from its managed download list over time, and an exact
pin eventually stops resolving on the build image.

### Environment variables

Set these in the Vercel project (Production and Preview):

| Variable                       | Purpose                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| `CONTENTFUL_SPACE_ID`          | Blog content                                                        |
| `CONTENTFUL_ACCESS_TOKEN`      | Blog content                                                        |
| `SMTP_USER`                    | Feedback email sender                                               |
| `SMTP_PASS`                    | Feedback email sender                                               |
| `ENABLE_EXPERIMENTAL_COREPACK` | Set to `1` so the pinned pnpm version is used                       |
| `CORS_ORIGINS`                 | Optional, comma-separated. Only needed for cross-origin API access. |
