# NOTE: this is basically a copy of the normal Dockerfile, but with `dev`
# passed to setup.sh instead of `normal`.
FROM node:10

ARG USER_UID=${UID:-1000}
ARG USER_GID=$USER_UID

COPY docker/setup.sh /setup.sh
RUN /setup.sh dev && rm /setup.sh
