# SaaS Cloudflare Template: Complete Setup Instructions

> This guide covers all required setup for Cloudflare services and third-party integrations (Stripe, Resend, Turnstile, etc.) to deploy and run your SaaS app.

---

## 1. Cloudflare Services Setup

### 1.1. Cloudflare D1 (Database)
- Create a new Cloudflare D1 database (e.g., `example_db`) via the Cloudflare dashboard or Wrangler CLI:
  ```sh
  npx wrangler d1 create example_db
  npx wrangler d1 execute example_db --remote --file=./db_schema/schema.sql
  ```
- Bind the D1 database in your `wrangler.toml`:
  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "example_db"
  database_id = "<your-d1-database-id>"
  ```

### 1.2. Cloudflare KV Namespaces
- Create two KV namespaces:
  - `login_session_cache` (for session management)
  - `rate_limit` (for rate limiting)
- Bind them in `wrangler.toml`:
  ```toml
  [[kv_namespaces]]
  binding = "LOGIN_SESSION_CACHE"
  id = "<your-login-session-cache-id>"

  [[kv_namespaces]]
  binding = "RATE_LIMIT"
  id = "<your-rate-limit-id>"
  ```

### 1.3. (Optional) Cloudflare R2 and Queues for Error Logging
- If you want error logging (not zero-cost):
  - Create an R2 bucket: `error-bucket`
  - Create a Queue: `error-queue`
  - Deploy the worker in `/workers/error_logger`:
    ```sh
    cd workers/error_logger
    npx wrangler deploy
    ```
  - Bind R2 and Queue in `wrangler.toml` as needed.
- For zero-cost, set `ENABLE_ERROR_LOGGING = false` in `src/config.js` (already done).

---

## 2. Environment Variables

Set these in your Cloudflare dashboard (production) and `.dev.vars` (local):

| Variable                | Purpose                        |
|-------------------------|--------------------------------|
| `LOGIN_JWT_SECRET`      | JWT signing secret             |
| `STRIPE_SECRET_KEY`     | Stripe API key                 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret          |
| `TURNSTILE_SECRET_KEY`  | Cloudflare Turnstile secret    |
| `RESEND_API_KEY`        | Resend email API key           |
| `LARK_BOT_URL`          | (Optional) Lark bot webhook    |

---

## 3. Third-Party Integrations

### 3.1. Stripe Billing
- Create a Stripe account and get your API keys.
- Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as environment variables.
- Configure your Stripe products and plans as needed.

### 3.2. Resend Email
- Create a [Resend](https://resend.com/) account.
- Add your domain and set up DNS records as instructed by Resend.
- Set `RESEND_API_KEY` as an environment variable.

### 3.3. Turnstile CAPTCHA
- Add your domain to Cloudflare Turnstile.
- Get your site key and secret key.
- Set the site key in `src/config.js` (public) and the secret key as `TURNSTILE_SECRET_KEY` (env var).

### 3.4. (Optional) Lark Bot for Error Notifications
- Create a Lark account and bot if you want error notifications.
- Set `LARK_BOT_URL` as an environment variable.

---

## 4. Security & Rate Limiting

- Rate limiting is enforced per-IP and per-user using Cloudflare KV (see `src/lib/server/rate_limit.js`).
- Security headers (CSP, X-Frame-Options, etc.) are set in `src/app.html`.
- All sensitive routes require authentication (see `src/hooks.server.js`).
- Input validation and method checks are enforced on all API endpoints.

---

## 5. Deployment

1. Install dependencies:
   ```sh
   npm install
   ```
2. Build the project:
   ```sh
   npm run build
   ```
3. Deploy to Cloudflare Pages/Workers:
   ```sh
   npx wrangler deploy
   ```

---

## 6. Additional Notes

- Update `src/config.js` with your production domain, website name, and other branding.
- For local development, use `.dev.vars` to set environment variables.
- For production, set all secrets in the Cloudflare dashboard.
- Review and update legal pages (privacy, terms) as needed for compliance.

---

## Alternative: Cloudflare Dashboard Setup (No CLI)

### 1. Cloudflare D1 (Database)
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select your account and site.
3. In the left sidebar, click **Workers & Pages** > **D1**.
4. Click **Create Database**.
   - Name it (e.g., `example_db`).
5. After creation, click your database, then **Query Editor**.
6. Copy-paste the contents of `db_schema/schema.sql` and click **Run** to create all tables.

### 2. Cloudflare KV Namespaces
1. In the sidebar, go to **Workers & Pages** > **KV**.
2. Click **Create namespace**.
   - Name one `login_session_cache`.
   - Name another `rate_limit`.
3. After creation, note the Namespace IDs.
4. In your Worker’s **Settings** > **Variables** > **KV Namespaces**, add:
   - `LOGIN_SESSION_CACHE` → [Namespace ID]
   - `RATE_LIMIT` → [Namespace ID]

### 3. (Optional) R2 Bucket and Queues for Error Logging
1. Go to **R2** in the sidebar.
   - Click **Create bucket** and name it `error-bucket`.
2. Go to **Queues** in the sidebar.
   - Click **Create queue** and name it `error-queue`.
3. In your Worker’s **Settings** > **Variables**, bind these as needed.

### 4. Environment Variables (Secrets)
1. Go to your Worker’s **Settings** > **Variables** > **Environment Variables**.
2. Add the following (use your real secrets/keys):
   - `LOGIN_JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `TURNSTILE_SECRET_KEY`
   - `RESEND_API_KEY`
   - (Optional) `LARK_BOT_URL`

### 5. Third-Party Integrations

#### Stripe
- [Create a Stripe account](https://dashboard.stripe.com/register).
- Get your API keys and webhook secret from the Stripe dashboard.
- Add them as environment variables in Cloudflare.

#### Resend
- [Create a Resend account](https://resend.com/).
- Add your domain and follow DNS instructions.
- Get your API key and add as an environment variable.

#### Turnstile
- Go to [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
- Add your domain, get the site key and secret key.
- Set the site key in `src/config.js` and the secret key as an environment variable.

### 6. Deploy Your Worker/Pages
1. In the Cloudflare Dashboard, go to **Workers & Pages**.
2. Click **Create Application** or select your existing Worker.
3. Upload your built project (from `npm run build`) or connect your GitHub repo.
4. In **Settings**, ensure all bindings (D1, KV, R2, Queues, Environment Variables) are set.
5. Click **Deploy**.

### 7. Final Steps
- Update `src/config.js` with your production domain and branding.
- Set up legal pages (privacy, terms) as needed.
- Test all user flows (sign up, sign in, billing, etc.).

**You can now run your SaaS entirely through the Cloudflare Dashboard, no CLI required!**

---

**You are now ready to launch your SaaS on Cloudflare!**
