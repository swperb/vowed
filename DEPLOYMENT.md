# Deploying Vowed to vowed.love

End-to-end guide to ship Vowed to production on **Vercel** with the domain **vowed.love**
(registered at your registrar: Namecheap / GoDaddy / etc.), **Clerk** for auth, and **Turso**
for the database.

Work top to bottom. Each step says where it happens (your terminal, a dashboard, your registrar).

---

## 0. What you need before starting

- [ ] `vowed.love` registered and you can edit its DNS records at your registrar
- [ ] A GitHub account (Vercel deploys from a Git repo)
- [ ] Accounts at [vercel.com](https://vercel.com), [clerk.com](https://clerk.com), [turso.tech](https://turso.tech)

---

## 1. Push the code to GitHub  (terminal)

The local git repo is already initialized and committed. Create the remote and push:

```bash
# Create the repo on GitHub (via gh CLI, or make an empty repo in the GitHub UI)
gh repo create swperb/vowed --public --source=. --remote=origin --push

# Or, if you made the empty repo manually:
git remote add origin https://github.com/swperb/vowed.git
git branch -M main
git push -u origin main
```

`.env.local` is gitignored, so your secrets do NOT get pushed. Good.

---

## 2. Turso production database  (terminal)

You can reuse your current `vowed` database, but a separate production DB is cleaner.

```bash
# Optional: a dedicated prod database
turso db create vowed-prod
turso db show vowed-prod --url            # -> libsql://vowed-prod-....turso.io

# Create a DATABASE token (NOT an account/API token):
turso db tokens create vowed-prod         # -> eyJ... (this is what goes in TURSO_AUTH_TOKEN)
```

Then push the schema to it:

```bash
TURSO_DATABASE_URL="libsql://vowed-prod-....turso.io" \
TURSO_AUTH_TOKEN="eyJ..." \
npm run db:push
```

> The 401 you hit earlier was from using an account/API token. Always use `turso db tokens create`,
> which mints a token scoped to read/write that specific database.

---

## 3. Clerk production instance  (Clerk dashboard + your registrar)

Development instances use `*.accounts.dev`. Production needs its own instance bound to your domain.

1. In the Clerk dashboard, top-left instance switcher, **Create production instance** (clone from dev).
2. Set **Application URLs**:
   - Home URL: `https://vowed.love`
   - Sign-in: `/sign-in`  ·  Sign-up: `/sign-up`
   - After sign-in fallback: `/dashboard`  ·  After sign-up fallback: `/onboarding`
3. Clerk shows a **DNS records** screen for the domain. Add each record at your registrar.
   The exact targets are shown in Clerk; the set is typically:

   | Type  | Host (name)            | Value (target, copy from Clerk) |
   |-------|------------------------|----------------------------------|
   | CNAME | `clerk`                | `frontend-api.clerk.services`    |
   | CNAME | `accounts`             | `accounts.clerk.services`        |
   | CNAME | `clkmail`              | `mail.<...>.clerk.services`      |
   | CNAME | `clk._domainkey`       | `dkim1.<...>.clerk.services`     |
   | CNAME | `clk2._domainkey`      | `dkim2.<...>.clerk.services`     |

4. Wait for Clerk to verify (minutes to a couple hours), then grab the **production API keys**:
   `pk_live_...` and `sk_live_...`. These go into Vercel in step 4.

> Production Clerk on `clerk.vowed.love` removes the `accounts.dev` handshake entirely, so the
> auth flow that the Preview tool blocked will work everywhere, including embedded previews.

---

## 4. Vercel project + environment variables  (Vercel dashboard)

1. **Add New > Project**, import `swperb/vowed` from GitHub. Vercel auto-detects Next.js. No config needed.
2. Before the first deploy, add **Environment Variables** (Production scope):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from step 3) |
   | `CLERK_SECRET_KEY` | `sk_live_...` (from step 3) |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/onboarding` |
   | `TURSO_DATABASE_URL` | `libsql://vowed-prod-....turso.io` (step 2) |
   | `TURSO_AUTH_TOKEN` | `eyJ...` database token (step 2) |
   | `NEXT_PUBLIC_APP_URL` | `https://vowed.love` |

3. **Deploy**. You will get a `vowed.vercel.app` URL first. Confirm it loads.

---

## 5. Point vowed.love at Vercel  (Vercel dashboard + your registrar)

1. In the Vercel project: **Settings > Domains > Add** `vowed.love` and `www.vowed.love`.
2. Vercel shows the records to add. At your registrar (Namecheap / GoDaddy), add:

   | Type  | Host (name) | Value |
   |-------|-------------|-------|
   | A     | `@`         | `76.76.21.21` |
   | CNAME | `www`       | `cname.vercel-dns.com` |

   - **Namecheap**: Domain List > Manage > Advanced DNS > Add New Record. Use `@` for the apex.
   - **GoDaddy**: DNS > Records. GoDaddy may require `@` for the A record host.
   - If your registrar does not allow a root CNAME, the A record above is the apex; the www CNAME handles `www`.

3. Vercel auto-provisions HTTPS once DNS propagates (minutes to a few hours). The dashboard shows "Valid Configuration" when ready.

---

## 6. Final wiring  (Vercel + Clerk)

- Confirm `NEXT_PUBLIC_APP_URL=https://vowed.love` is set in Vercel (step 4).
- In Clerk production settings, make sure `https://vowed.love` is the Home URL and is listed as an allowed origin.
- Redeploy if you changed any env var after the first deploy (Vercel > Deployments > Redeploy).

---

## 7. Verification checklist

- [ ] `https://vowed.love` loads the landing page over HTTPS
- [ ] `https://www.vowed.love` redirects to the apex
- [ ] Sign up creates a Clerk user and lands on `/onboarding`
- [ ] Onboarding writes a wedding row (check `turso db shell vowed-prod "select * from weddings;"`)
- [ ] Dashboard, Guests, Budget, Checklist all load
- [ ] A public RSVP link `https://vowed.love/rsvp/<slug>` resolves and accepts a response

---

## Tools summary

| Concern   | Tool        | Where it lives          |
|-----------|-------------|-------------------------|
| Domain    | your registrar | DNS records          |
| Hosting   | Vercel      | `swperb/vowed` project  |
| Auth      | Clerk (prod) | `clerk.vowed.love`     |
| Database  | Turso       | `vowed-prod`            |
| Source    | GitHub      | `swperb/vowed`          |

Future pushes to `main` auto-deploy. Pull requests get preview deployments automatically.
