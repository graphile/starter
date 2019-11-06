#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

FROM graphile-starter_webapp:latest

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

# Configure apt and install packages
RUN \
  apt-get update \
  # install git
  && apt-get -y install --no-install-recommends git \
  # neovim
  && apt-get -y install --no-install-recommends neovim \
  # tmux
  && apt-get -y install --no-install-recommends tmux \
  # dos2unix for config files of windows user
  && apt-get -y install --no-install-recommends dos2unix \
  # Clean up
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=
