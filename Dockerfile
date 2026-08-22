FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first so edits to content or templates reuse the install layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:all

FROM node:22-alpine
WORKDIR /app

LABEL org.opencontainers.image.title="murq.in" \
      org.opencontainers.image.description="Icarus Murqin's personal site — static Astro build served by a dependency-free Node server." \
      org.opencontainers.image.source="https://github.com/Murqin/Murq.in" \
      org.opencontainers.image.licenses="MIT" \
      cosmos-auto-update="true"

ENV NODE_ENV=production \
    SITE_ROOT=/app/site \
    DATA_DIR=/data \
    PORT=8080

COPY --from=build /app/dist ./site
COPY --from=build /app/server/dist ./server

# The visitor count is the only mutable state; everything else is immutable.
# Bind-mount a host directory here, owned by uid 1000, or the count resets on
# every container recreation (which auto-update does on each new image).
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/visitors').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/server.js"]
