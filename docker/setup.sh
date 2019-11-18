#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

set -e

# Avoid warnings by switching to noninteractive
export DEBIAN_FRONTEND=noninteractive

apt-get update

apt-get install -y --no-install-recommends apt-utils dialog 2>&1
apt-get install -y curl apt-transport-https lsb-release
curl -sS https://dl.yarnpkg.com/$(lsb_release -is | tr '[:upper:]' '[:lower:]')/pubkey.gpg | apt-key add - 2>/dev/null
echo "deb https://dl.yarnpkg.com/$(lsb_release -is | tr '[:upper:]' '[:lower:]')/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update

# Install docker and docker-compose (for setup)
curl https://get.docker.com/builds/Linux/x86_64/docker-latest.tgz | tar xvz -C /tmp/ && mv /tmp/docker/docker /usr/bin/docker
curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod 755 /usr/local/bin/docker-compose

# Verify git and needed tools are installed
apt-get -y install git bash-completion iproute2 procps

# Remove outdated yarn from /opt and install via package
# so it can be easily updated via apt-get upgrade yarn
rm -rf /opt/yarn-*
rm -f /usr/local/bin/yarn
rm -f /usr/local/bin/yarnpkg

apt-get -y install --no-install-recommends yarn

# Install eslint globally
npm install -g eslint

# [Optional] Update a non-root user to match UID/GID - see https://aka.ms/vscode-remote/containers/non-root-user.
if [ "$USER_GID" != "1000" ]; then groupmod node --gid $USER_GID; fi
if [ "$USER_UID" != "1000" ]; then usermod --uid $USER_UID node; fi

# Add the user to the docker group so they can access /var/run/docker.sock
groupadd -g 999 docker
usermod -a -G docker node

# [Optional] Add add sudo support for non-root user
apt-get install -y sudo
echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node
chmod 0440 /etc/sudoers.d/node

if [ "$1" = "dev" ]; then
  # locales for tmux: https://github.com/GameServerManagers/LinuxGSM/issues/817
  # dos2unix for config files of windows user
  apt-get -y install --no-install-recommends neovim tmux locales dos2unix
fi

# Clean up
apt-get autoremove -y
apt-get clean -y
rm -rf /var/lib/apt/lists/*
