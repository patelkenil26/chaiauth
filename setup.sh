#!/bin/bash
# One-time local setup: creates .env from .env.example if missing.
# All apps read the single root .env (turbo envMode is "loose" + dotenv-cli).
if [ -f ".env" ]; then
  echo ".env file exists. ✅"
else
  cp .env.example .env && echo "Created .env from .env.example ✅"
fi
