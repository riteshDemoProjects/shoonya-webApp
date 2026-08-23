# Deploying Shoonya Farms to an Oracle Cloud VM

One Ubuntu instance runs four containers behind published ports 80 and 8080;
the database is managed Supabase PostgreSQL.

```
                         Internet
                 :80 ──────┴────── :8080
        ┌──────────────────┐  ┌──────────────────┐
        │ web (Caddy+SPA)  │  │ admin (Caddy+SPA)│   published
        │  /api/*  ────────┼──┼──► /admin/*      │
        └────────┬─────────┘  └────────┬─────────┘
                 ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ web-api  :8001   │  │ admin-api :8000  │   internal only
        └────────┬─────────┘  └────────┬─────────┘
                 └──────────┬──────────┘
                            ▼
                 Supabase PostgreSQL (use ap-south-1 / Mumbai)
```

Each SPA is served by a Caddy that also proxies its own API, so the browser talks
to a single origin — **no CORS configuration anywhere**.

---

## Step 0 — Prerequisites in the source tree (do this first, locally)

Two things currently block a clean deploy.

### 0a. `admin-dashboard` is not under version control

There is no git repo in `admin-dashboard/`, so there is no way to get it onto the
VM reproducibly and no way to roll back. Put both projects in one repo (they
deploy as one unit and share a database, so a monorepo matches reality):

```bash
cd H:/shoony-web && git init && git add . && git commit -m "Add deployment configuration"
```

If you prefer to keep `shoonya-webApp` as its own repo, instead run `git init`
inside `admin-dashboard` and push it separately — but then you must clone both on
the VM into the same parent directory, because `docker-compose.yml` lives there
and references both paths.

### 0b. `backend/shoonya.db` is committed to git

It is listed in `.gitignore`, but it was committed before that rule existed, so
the rule has no effect — a 60 KB SQLite file with real users, password hashes and
orders is in your history and will ship to the VM. Stop tracking it:

```bash
cd H:/shoony-web/shoonya-webApp && git rm --cached backend/shoonya.db && git commit -m "Stop tracking local SQLite database"
```

(The `.dockerignore` files already keep it out of the images regardless.)

---

## Step 1 — Provision Supabase and import your data

1. Create a Supabase project in the **Mumbai (ap-south-1)** region.
2. Copy the **pooler** connection URI (Project Settings → Database → Connection
   string), the one on port **6543**.
3. Import the existing SQLite data, from your local machine:

```bash
cd H:/shoony-web/shoonya-webApp/backend && DATABASE_URL="<supabase-uri>" .venv/Scripts/python.exe -m app.seed --force
```

To copy the current rows instead of re-seeding the catalog, use the migration
script — it refuses to run against a non-empty target, so it cannot double-import:

```bash
cd H:/shoony-web/admin-dashboard/backend && DATABASE_URL="<supabase-uri>" python migrate_sqlite_to_supabase.py
```

---

## Step 2 — Open the ports (Oracle Cloud has TWO firewalls)

**This is the single most common OCI deployment failure.** You must open the
ports in both places or the site is unreachable while everything looks healthy.

### 2a. VCN Security List (OCI console)

Networking → Virtual Cloud Networks → your VCN → Security Lists → Default →
**Add Ingress Rules**:

| Source CIDR | Protocol | Destination port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `<your-ip>/32` | TCP | 8080 |

Restrict 8080 to your own IP — see the security note at the end.

### 2b. Host firewall (on the VM)

Ubuntu images on OCI ship iptables rules that reject everything except SSH.
Check where the REJECT rule sits, then insert before it:

```bash
sudo iptables -L INPUT --line-numbers
```

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT && sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT && sudo netfilter-persistent save
```

Adjust `6` so the new rules land **above** the `REJECT all` line.

---

## Step 3 — Install Docker on the VM

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl git && sudo install -m 0755 -d /etc/apt/keyrings && sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && sudo chmod a+r /etc/apt/keyrings/docker.asc
```

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

```bash
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && sudo usermod -aG docker $USER
```

Log out and back in so the group membership applies.

> On an Ampere (ARM) shape — the OCI always-free default — no changes are
> needed: every base image used here is multi-arch.

---

## Step 4 — Deploy

```bash
git clone <your-repo-url> shoony-web && cd shoony-web && cp .env.example .env
```

Fill in `.env` (`SUPABASE_DATABASE_URL`, and two distinct keys from
`openssl rand -hex 32`), then:

```bash
docker compose up -d --build
```

Now create the first admin account. **This step is mandatory, not optional.**
`web-api` owns the shared schema, but its models do not include the `admins`
table — only the admin project defines it, and `admin-api` skips schema creation
at boot (`RUN_SCHEMA_INIT=0`) so the two services never run DDL concurrently.
The seeder is what creates that table. Skip it and admin login returns
`500 relation "admins" does not exist` rather than a clean auth failure.

With `ADMIN_PASSWORD` unset the seeder generates a strong password and prints it
once — copy it immediately:

```bash
docker compose run --rm admin-api python -m app.seed_admin
```

To choose the password yourself instead:

```bash
docker compose run --rm -e ADMIN_PASSWORD='<your-password>' -e ADMIN_EMAIL='you@example.com' admin-api python -m app.seed_admin
```

---

## Step 5 — Verify

```bash
docker compose ps && curl -sS -o /dev/null -w "storefront:%{http_code}\n" http://localhost/ && curl -sS http://localhost/api/health && curl -sS -o /dev/null -w "\nadmin:%{http_code}\n" http://localhost:8080/
```

Then open `http://<vm-public-ip>/` and `http://<vm-public-ip>:8080/`.

If a container is unhealthy: `docker compose logs -f web-api admin-api`.

---

## Verified before hand-off

The whole stack was built and run end to end against a throwaway PostgreSQL
before this guide was written. Confirmed working: both images build on
`python:3.12-slim`, all four containers report healthy, the storefront serves at
`/` and proxies `/api/*`, the admin serves at `/` on its own port and proxies
`/admin/*`, SPA fallback works on client-side routes for both, admin login
returns 401 on a wrong password and a JWT on the right one, and the admin reads
the same database the storefront seeded (42 products visible from both APIs).

Three latent bugs were found and fixed in the process — see the commit: a missing
`psycopg` driver, a missing `email-validator` dependency that crashed `admin-api`
at import time, and an admin SQLite fallback path that pointed two directories
too high.

---

## Updating and rolling back

```bash
cd ~/shoony-web && git pull && docker compose up -d --build
```

Rollback is a checkout plus a rebuild:

```bash
git checkout <previous-commit> && docker compose up -d --build
```

---

## Security: read before going live

- **There is no HTTPS yet.** Every request — including admin and customer login
  passwords — crosses the internet in cleartext. This is acceptable only for
  testing. Until you attach a domain, keep port 8080 restricted to your own IP
  (Step 2a), or publish it on `127.0.0.1:8080` and reach it over an SSH tunnel:
  `ssh -L 8080:localhost:8080 ubuntu@<vm-ip>`.
- **Adding a domain later requires no rework.** Point an A record at the VM,
  change `:80` to your hostname in each `Caddyfile`, publish 443, and Caddy
  provisions Let's Encrypt certificates automatically.
- **Rotate the admin password** if `admin123` was ever used — the old seeder
  hardcoded it, so that account may already exist in your database.
- Both API containers are `expose`d, not `ports`-published: they cannot be
  reached from the internet directly.

## Known gaps, deliberately not addressed here

- **No schema migrations.** `ensure_schema()` no-ops on PostgreSQL and there is
  no Alembic setup. The first deploy is fine (`create_all` builds the tables),
  but before the schema changes again, add Alembic. `web-api` is the designated
  schema owner (`RUN_SCHEMA_INIT=0` on `admin-api`) so the two services do not
  race on startup.
- **No backups configured.** Supabase's free tier keeps limited automatic
  backups; add your own `pg_dump` schedule before taking real orders.
- `admin-dashboard/frontend/index.html` references `/logo.svg`, but that project
  has no `public/` directory — the favicon will 404 until you add one.
