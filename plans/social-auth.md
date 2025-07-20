## Revised Google Social Auth Plan—Including **austyle.io** on GoDaddy

The earlier Passport + JWT flow stays the same; the new work is (A) **prove to Google you control austyle.io**, (B) add the domain to your OAuth‑2.0 consent screen, and (C) point sub‑domains to each service.

---

### 1 ▪ Verify **austyle.io** ownership with Google

| Step | Action                                                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | In **Google Cloud Console ➜ OAuth consent screen ➜ Edit app ➜ Authorized domains ➜ + Add domain**. Enter `austyle.io`. Google now prompts for verification.                                                     |
| 1.2  | Click **Verify** → it opens Search Console with a **TXT record** (looks like `google-site-verification=abc123…`).                                                                                               |
| 1.3  | Sign in to **GoDaddy** ➜ *DNS Management* for austyle.io ➜ add a **TXT** record: <br>`Host` = `@` (root) `TXT Value` = the verification string `TTL` = 1 hour. ([GoDaddy][1])                                   |
| 1.4  | Back in Search Console click **Verify**. Propagation can take up to an hour, but usually < 5 min. When it turns green, Google marks the domain “verified” and your OAuth screen accepts it. ([Google Cloud][2]) |

*You only have to do this once per naked domain; sub‑domains inherit the trust.*

---

### 2 ▪ Define sub‑domains & DNS records in GoDaddy

| Sub‑domain             | Purpose                         | DNS change (GoDaddy)                                                               |
| ---------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `app.austyle.io`       | React / TanStack Start frontend | **`CNAME`** → hosting service (e.g. Vercel) **or** `A` → server IP if self‑hosting |
| `api.austyle.io`       | Express + ShareDB backend       | **`A`** → server IP (or `CNAME` to proxy/LB)                                       |
| *Optional* `staging.*` | CI preview                      | CNAME to staging host                                                              |

DNS changes do **not** affect local dev; they simply prepare production/staging. If you’re still running everything locally, you can add to `/etc/hosts` for manual testing:

```
127.0.0.1  app.austyle.io
127.0.0.1  api.austyle.io
```

---

### 3 ▪ Update Google OAuth 2.0 credentials

Create **two** Web‑application clients so you never mix localhost & prod:

| Client   | Authorized JS Origins    | Redirect URIs                                                                                                           |
| -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Dev**  | `http://localhost:3000`  | `http://localhost:3001/auth/google/callback`                                                                            |
| **Prod** | `https://app.austyle.io` | `https://api.austyle.io/auth/google/callback` (server)  & `https://app.austyle.io/social-callback` (SPA fragment route) |

Add **both** `app.austyle.io` and `api.austyle.io` to the “Authorized domains” list. Google rejects any OAuth request whose redirect host isn’t on that list. ([Google Help][3])

---

### 4 ▪ Backend (`apps/server`) changes

1. **Env vars**

   ```
   # .env.dev
   FRONTEND_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=dev‑client‑id
   GOOGLE_CLIENT_SECRET=dev‑secret
   ```

   ```
   # .env.prod
   FRONTEND_URL=https://app.austyle.io
   GOOGLE_CLIENT_ID=prod‑client‑id
   GOOGLE_CLIENT_SECRET=prod‑secret
   ```

   Use `dotenv-flow` or similar so `NODE_ENV` switches which file is loaded.

2. **CORS**

   ```ts
   app.use(cors({
     origin: [process.env.FRONTEND_URL, 'http://localhost:3000'], // both for safety
     credentials: true
   }));
   ```

3. **Redirect logic**

   ```ts
   res.redirect(
     `${process.env.FRONTEND_URL}/social-callback#access=${access}&refresh=${refresh}`
   );
   ```

Everything else (Passport strategy, JWT issuing, ShareDB middleware) is unchanged.

---

### 5 ▪ Frontend tweaks

*In production build config (e.g. Vite):*

```ts
define: {
  'process.env.API_URL': JSON.stringify(import.meta.env.PROD
     ? 'https://api.austyle.io'
     : 'http://localhost:3001')
}
```

The Google login button still hits `https://api.austyle.io/auth/google`, so no code change—just environment.

---

### 6 ▪ Dev‑container & Docker updates

```yaml
# .devcontainer/docker-compose.yml
services:
  server:
    env_file:
      - ../.env.dev           # mounts dev vars by default
```

For prod/staging containers you’ll bind‑mount `.env.prod` or pass secrets via your orchestration stack.

---

### 7 ▪ HTTPS certificates (prod preview)

Google **requires https** for non‑localhost OAuth. When you later deploy:

* Use Let’s Encrypt (Certbot) or your host’s automatic TLS to secure both sub‑domains.
* Add an `A` record for the root `austyle.io` (optional).
* If you front everything with a reverse‑proxy (Nginx, Caddy, Traefik), terminate TLS there and proxy to the `api` service.

---

### 8 ▪ CI secrets

Add to **GitHub Actions → Settings → Secrets & variables**:

| Name                                                  | Value                                   |
| ----------------------------------------------------- | --------------------------------------- |
| `GOOGLE_CLIENT_ID_DEV` / `GOOGLE_CLIENT_SECRET_DEV`   | dev creds                               |
| `GOOGLE_CLIENT_ID_PROD` / `GOOGLE_CLIENT_SECRET_PROD` | prod creds (if you run e2e on prod URL) |

Your CI job uses dummy values for unit tests, real values only for E2E browser tests hitting `https://staging.austyle.io`.

---

### 9 ▪ Security sanity‑check

* `austyle.io` now appears in **Authorized domains** and DNS TXT is verified.
* Redirect URIs use **https** and exact paths—Google matches *full* string.
* Short‑lived **access** JWT travels in WS query string; refresh stays HTTP‑only cookie or localStorage per your policy (unchanged).
* CORS only whitelists `app.austyle.io` and localhost, blocking origin spoofing.

---

### 10 ▪ Workflow recap

1. User visits **[https://app.austyle.io](https://app.austyle.io)** (served from `app` container or host).
2. Presses “Sign in with Google” → browser redirects to Google OAuth screen (with client ID that lists austyle.io as authorized).
3. Google auths user and POSTs back to **[https://api.austyle.io/auth/google/callback](https://api.austyle.io/auth/google/callback)**.
4. Server upserts Google user, issues your **JWT pair**, and `302`s to **[https://app.austyle.io/social-callback#access=…](https://app.austyle.io/social-callback#access=…)**.
5. SPA reads fragment, stores tokens, opens ShareDB WS at **wss\://api.austyle.io?token=JWT**—ShareDB middleware validates & injects `userId`.
6. All REST and OT operations proceed exactly as before, but now on your custom domain.

Your project is now domain‑aware and production‑ready while preserving the local‑dev experience.

[1]: https://www.godaddy.com/help/verify-domain-ownership-with-another-company-9215?utm_source=chatgpt.com "Verify domain ownership with another company - GoDaddy"
[2]: https://cloud.google.com/identity/docs/verify-domain-txt?utm_source=chatgpt.com "Verifying your domain with a TXT record | Cloud Identity"
[3]: https://support.google.com/cloud/answer/15549257?hl=en&utm_source=chatgpt.com "Manage OAuth Clients - Google Cloud Platform Console Help"
