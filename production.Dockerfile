# Global args, set before the first FROM, shared by all stages
ARG PORT=5678
ARG NODE_ENV="production"
ARG ROOT_URL="http://localhost:${PORT}"
ARG TARGET="server"

################################################################################
# Build stage 1 - `yarn build`

FROM node:12-alpine as builder
# Import our shared args
ARG NODE_ENV
ARG ROOT_URL

COPY lerna.json package.json tsconfig.json yarn.lock @app/ scripts/ data/ /app/
WORKDIR /app/
RUN yarn install --frozen-lockfile --production=false --no-progress && yarn run build

################################################################################
# Build stage 2 - COPY the relevant things (multiple steps)

FROM node:12-alpine as clean
# Import our shared args
ARG NODE_ENV
ARG ROOT_URL

# Copy over selectively just the tings we need, try and avoid the rest
COPY --from=builder /app/lerna.json /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/@app/config/ /app/@app/db/ /app/@app/graphql/ /app/@app/
COPY --from=builder /app/@app/components/package.json /app/@app/components/dist/ /app/@app/components/
COPY --from=builder /app/@app/client/package.json /app/@app/client/assets/ /app/@app/client/.next /app/@app/client/
COPY --from=builder /app/@app/client/src/next.config.js /app/@app/client/src/next.config.js
COPY --from=builder /app/@app/server/package.json /app/@app/server/postgraphile.tags.jsonc /app/@app/server/dist/ /app/@app/server/
COPY --from=builder /app/@app/worker/package.json /app/@app/worker/templates/ /app/@app/worker/dist/ /app/@app/worker/

# Shared args shouldn't be overridable at runtime (because they're baked into
# the built JS).
#
# Further, they aren't available in ENTRYPOINT (because it's at runtime), so
# push them to a .env file that we can source from ENTRYPOINT.
RUN echo -e "NODE_ENV=$NODE_ENV\nROOT_URL=$ROOT_URL" > /app/.env && rm -Rf /app/node_modules /app/@app/*/node_modules

################################################################################
# Build stage FINAL - COPY everything, once, and then do a clean `yarn install`

FROM node:12-alpine

EXPOSE $PORT
WORKDIR /app/
# Copy everything from stage 2, it's already been filtered
COPY --from=clean /app/ /app/

# Install yarn ASAP because it's the slowest
RUN yarn install --frozen-lockfile --production=true --no-progress

# Import our shared args
ARG PORT
ARG NODE_ENV
ARG ROOT_URL
ARG TARGET

LABEL description="My PostGraphile-powered $TARGET"

# You might want to disable GRAPHILE_TURBO if you have issues
ENV GRAPHILE_TURBO=1 TARGET=$TARGET PORT=$PORT DATABASE_HOST="pg" DATABASE_NAME="graphile_starter" DATABASE_OWNER="${DATABASE_NAME}" DATABASE_VISITOR="${DATABASE_NAME}_visitor" DATABASE_AUTHENTICATOR="${DATABASE_NAME}_authenticator"

# Entrypoint last so that we can run `sh` in previous build steps for debugging
ENTRYPOINT yarn "${TARGET}" start
