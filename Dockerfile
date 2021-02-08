FROM node:14

# The node image comes with a base non-root 'node' user which this Dockerfile
# gives sudo access. However, for Linux, this user's GID/UID must match your local
# user UID/GID to avoid permission issues with bind mounts. Update USER_UID / USER_GID
# if yours is not 1000. See https://aka.ms/vscode-remote/containers/non-root-user.
ARG USER_UID=${UID:-1000}
ARG SETUP_MODE=normal

COPY docker/setup.sh /setup.sh
RUN /setup.sh $SETUP_MODE
