#!/bin/bash
# Script to run Caddy server
# This assumes Caddy is installed globally via 'apt install caddy' or similar

cd "$(dirname "$0")"
caddy run --config Caddyfile
