# Global args, set before the first FROM, shared by all stages
ARG PORT=5678
ARG NODE_ENV="production"
ARG ROOT_DOMAIN="localhost:$PORT"
ARG ROOT_URL="http://${ROOT_DOMAIN}"
ARG TARGET="server"

################################################################################
# Build stage 1 - `yarn build`

FROM node:12-alpine as builder
ARG PORT
ARG NODE_ENV
ARG ROOT_DOMAIN
ARG ROOT_URL
ARG TARGET

# Cache node_modules for as long as possible
COPY package.json yarn.lock /app/
WORKDIR /app/
RUN yarn install --frozen-lockfile --production=false --no-progress

COPY tsconfig.json codegen.yml /app/
# Folders must be copied separately, files can be copied all at once
COPY data/ /app/data/
COPY backend/ /app/backend/
COPY scripts/ /app/scripts/
COPY client/ /app/client/

# Finally run the build script
RUN yarn run build

################################################################################
# Build stage 2 - COPY the relevant things (multiple steps)

FROM node:12-alpine as clean
ARG PORT
ARG NODE_ENV
ARG ROOT_DOMAIN
ARG ROOT_URL
ARG TARGET

# Again, install yarn ASAP because it's the slowest
COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/backend/dist/ /app/backend/dist/
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/client/src/next.config.js /app/client/src/next.config.js
COPY --from=builder /app/client/assets /app/client/assets

################################################################################
# Build stage FINAL - COPY everything, once, and then do a clean `yarn install`

FROM node:12-alpine
ARG PORT
ARG NODE_ENV
ARG ROOT_DOMAIN
ARG ROOT_URL
ARG TARGET

EXPOSE $PORT
WORKDIR /app/
COPY --from=clean /app/ /app/

RUN yarn install --frozen-lockfile --production=true --no-progress

LABEL description="My PostGraphile-powered $TARGET"

ENV GRAPHILE_TURBO=1 server_or_worker=$TARGET NODE_ENV="$NODE_ENV" ROOT_DOMAIN="$ROOT_DOMAIN" ROOT_URL="$ROOT_URL" PORT="$PORT"
ENTRYPOINT yarn "backend:${server_or_worker}:run"
