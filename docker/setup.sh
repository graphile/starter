#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

set -e

# Avoid warnings by switching to noninteractive
export DEBIAN_FRONTEND=noninteractive

# Remove outdated yarn from /opt
rm -rf /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

# Install most things we need
apt-get update
apt-get install -y --no-install-recommends \
  apt-transport-https \
  apt-utils \
  bash-completion \
  curl \
  dialog \
  git \
  iproute2 \
  lsb-release \
  procps \
  sudo

LINUX_DISTRO=$(lsb_release -is | tr '[:upper:]' '[:lower:]') # eg. debian

# Add additional apt sources...
curl -sS https://dl.yarnpkg.com/$LINUX_DISTRO/pubkey.gpg | apt-key add - 2>/dev/null
echo "deb https://dl.yarnpkg.com/$LINUX_DISTRO/ stable main" | tee /etc/apt/sources.list.d/yarn.list
# ... and import them
apt-get update

# Install yarn via package so it can be easily updated via apt-get upgrade yarn
apt-get -y install --no-install-recommends yarn

# './setup.sh dev' installs more handy development utilities...
if [ "$1" = "dev" ]; then
  # locales for tmux: https://github.com/GameServerManagers/LinuxGSM/issues/817
  # dos2unix for config files of windows user
  apt-get install -y --no-install-recommends neovim tmux locales dos2unix
fi

# Install eslint globally
yarn global add eslint

### Install docker and docker compose (for setup)
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# on windows there is no USER_UID
if [ "$USER_UID" != "" ]; then
  echo "\$USER_UID given: $USER_UID";
  # [Optional] Update a non-root user to match UID/GID - see https://aka.ms/vscode-remote/containers/non-root-user.
  if [ "$USER_UID" != "1000" ]; then
    usermod --uid "$USER_UID" node;
  fi
fi

# Add the user to the docker group so they can access /var/run/docker.sock
groupadd -g 999 docker
usermod -a -G docker node

# [Optional] Add add sudo support for non-root user
echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node
chmod 0440 /etc/sudoers.d/node

# Clean up
apt-get autoremove -y
apt-get clean -y
rm -rf /var/lib/apt/lists/*

# Fix permissions (inspired by https://hub.docker.com/r/bitnami/express/dockerfile/)
mkdir -p /dist /app /.npm /.yarn /.config /.cache /.local
touch /.yarnrc
chmod g+rwX /dist /app /.npm /.yarn /.config /.cache /.local /.yarnrc

# Self-destruct
rm /setup.sh
