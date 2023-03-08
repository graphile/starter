#!/usr/bin/env bash

# We don't understand how this works, but on Mac you get the following error sometimes due to Docker volume ownership issues:
#     fatal: detected dubious ownership in repository at '/work'
#     To add an exception for this directory, call: [...]
# But weirdly, just listing the directory fixes it. 🤷
ls >/dev/null
