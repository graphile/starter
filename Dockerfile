FROM node:12-alpine as builder

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

########################################

FROM node:12-alpine as clean

# Again, install yarn ASAP because it's the slowest
COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/backend/dist/ /app/backend/dist/
COPY --from=builder /app/.next /app/.next

########################################

FROM node:12-alpine

EXPOSE 5000
ENV GRAPHILE_TURBO=1
WORKDIR /app/
COPY --from=clean /app/ /app/

RUN yarn install --frozen-lockfile --production=true --no-progress

ARG TARGET=server
LABEL description="My PostGraphile-powered $TARGET"
ENV server_or_worker=$TARGET

# TODO: deal with the init (process 1) issue for signal handling
ENTRYPOINT ./backend/dist/${server_or_worker}/index.js
