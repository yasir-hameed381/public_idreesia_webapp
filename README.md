# Idreesia Web (Frontend)

Next.js 15 frontend for Idreesia with i18n (next-intl), Redux, and Tailwind CSS.

## Prerequisites

- **Node.js** 18.18+ or 20+ (LTS recommended)
- **npm**, **yarn**, or **pnpm**

## Implementation Steps (Public Build)

### 1. Get the code

```bash
git clone <repository-url>
cd Idreesia_web
```

(Or copy the project folder and navigate into it.)

### 2. Install dependencies

```bash
npm install
```

(or `yarn install` / `pnpm install`)

### 3. Environment variables

Create a `.env` or `.env.local` file in the project root with at least:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (used for all API calls) | `https://api.example.com` or `https://api.example.com/api` |
| `NEXT_PUBLIC_LARAVEL_URL` | No | Laravel/base URL if different from API host | Same as API base or leave empty |

- Do not add a trailing slash to `NEXT_PUBLIC_API_URL` (the app normalizes it).
- For local development, use your backend URL (e.g. `http://localhost:3000` or your API port).

Example `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_LARAVEL_URL=https://your-api-domain.com
```

### 4. Build for production

```bash
npm run build
```

This runs `next build` and produces an optimized output in `.next/`.

### 5. Run the production build

```bash
npm start
```

Serves the app at [http://localhost:3000](http://localhost:3000) by default.

### 6. (Optional) Run in development

```bash
npm run dev
```

Starts the development server with hot reload.

---

## Scripts Summary

| Script | Command | Purpose |
|--------|---------|---------|
| Dev | `npm run dev` | Start development server |
| Build | `npm run build` | Create production build |
| Start | `npm run start` | Serve production build |
| Pre-deploy | `npm run pre-deploy` | Run pre-deploy checks |
| Vercel deploy | `npm run vercel-deploy` | Pre-deploy + Vercel production deploy |

---

## Tech Stack

- **Next.js** 15 (App Router)
- **next-intl** for i18n (locales: e.g. `en`, `ur`)
- **Redux Toolkit** + **redux-persist**
- **Tailwind CSS** 4
- **TypeScript**

---

## Deployment (e.g. Vercel)

1. Connect the repository to Vercel.
2. Set `NEXT_PUBLIC_API_URL` (and `NEXT_PUBLIC_LARAVEL_URL` if needed) in the project **Environment Variables**.
3. Build command: `npm run build`
4. Output: use default (Next.js auto-detected).

Ensure your backend API allows requests from your frontend origin (CORS).
