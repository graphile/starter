# Global args, set before the first FROM, shared by all stages
ARG PORT=5678
ARG NODE_ENV="production"
ARG ROOT_DOMAIN="localhost:$PORT"
ARG ROOT_URL="http://${ROOT_DOMAIN}"
ARG TARGET="server"

################################################################################
# Build stage 1 - `yarn build`

FROM node:12-alpine as builder
# Import our shared args
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
# Import our shared args
ARG PORT
ARG NODE_ENV
ARG ROOT_DOMAIN
ARG ROOT_URL
ARG TARGET

# Copy over selectively just the tings we need, try and avoid the rest
COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/backend/dist/ /app/backend/dist/
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/client/src/next.config.js /app/client/src/next.config.js
COPY --from=builder /app/client/assets /app/client/assets
COPY --from=builder /app/scripts/env /app/scripts/env

# Shared args shouldn't be overridable at runtime (because they're baked into
# the built JS).
#
# Further, they aren't available in ENTRYPOINT (because it's at runtime), so
# push them to a .env file that we can source from ENTRYPOINT.
RUN echo "export PORT=\"$PORT\" NODE_ENV=\"$NODE_ENV\" ROOT_DOMAIN=\"$ROOT_DOMAIN\" ROOT_URL=\"$ROOT_URL\" TARGET=\"TARGET\"" >> /app/.env && chmod +x /app/.env

################################################################################
# Build stage FINAL - COPY everything, once, and then do a clean `yarn install`

FROM node:12-alpine
# Import our shared args
ARG PORT
ARG NODE_ENV
ARG ROOT_DOMAIN
ARG ROOT_URL
ARG TARGET

EXPOSE $PORT
WORKDIR /app/
# Copy everything from stage 2, it's already been filtered
COPY --from=clean /app/ /app/

# Install yarn ASAP because it's the slowest
RUN yarn install --frozen-lockfile --production=true --no-progress

LABEL description="My PostGraphile-powered $TARGET"

# You might want to disable GRAPHILE_TURBO if you have issues
ENV GRAPHILE_TURBO=1 TARGET=$TARGET
ENTRYPOINT yarn "backend:${TARGET}:run"
