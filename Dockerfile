# Build stage
FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ENV NITRO_PRESET=node-server
RUN npm run build

# Runtime stage - run Nitro node server
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy built output (server + public assets) - node-server preset outputs to .output/
COPY --from=build /app/.output ./

EXPOSE 3000

# Health check - test the SSR server root responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "server/index.mjs"]