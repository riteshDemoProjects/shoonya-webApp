# --- build stage -----------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy manifests first so the dependency layer caches across source-only changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# No VITE_API_URL: src/api.js defaults to "/api", which Caddy below forwards to
# the API container. Same-origin means no CORS and no rebuild to change hosts.
RUN npm run build

# --- runtime stage ---------------------------------------------------------
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80
