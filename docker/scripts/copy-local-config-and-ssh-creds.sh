#!/usr/bin/env bash

echo "copy local configs"

# Copy ssh creed from local home
# Needed for e.g. git push etc
mkdir -p /root/.ssh
cp -r /root/.home-localhost/.ssh/* /root/.ssh
chmod 600 /root/.ssh/*

# Copy gitconfig
cp /root/.home-localhost/.gitconfig /root/.gitconfig
# Copy bashconfig
cp /root/.home-localhost/.bashrc /root/.bashrc
# Copy tmux
cp /root/.home-localhost/tmux.conf /root/tmux.conf
# Copy vimrc for vim & nvim
mkdir -p /root/.config/nvim
echo "/root/.vimrc /root/.config/nvim/init.vim" | xargs -n 1 cp -v /root/.home-localhost/.vimrc

# Copy vim plugins, eg. "https://github.com/junegunn/vim-plug"
mkdir -p ~/.vim/autoload
mkdir -p /root/.local/share/nvim/site/autoload
echo "/root/.vim/autoload/ /root/.local/share/nvim/site/autoload/" | xargs -n 1 cp -r -v /root/.home-localhost/.vim/autoload/*
echo "/root/.bashrc /root/.gitconfig /root/.ssh/config /root/.vimrc /root/.config/nvim/init.vim" | xargs -n 1 dos2unix

# Installs (n)vim plugins
nvim +'PlugInstall --sync' +qa true
