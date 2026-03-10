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

## Deploying to Heroku

1. **Log in to Heroku**

   ```bash
   heroku login
   ```

2. **Set the remote**

   ```bash
   heroku git:remote -a knapsnack
   ```

3. **Deploy**

   ```bash
   git push heroku main
   ```
