# --- build stage -----------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# No VITE_API_URL: src/api.js defaults to "" and calls /admin/*, which Caddy
# below forwards to the admin API container.
RUN npm run build

# --- runtime stage ---------------------------------------------------------
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80
