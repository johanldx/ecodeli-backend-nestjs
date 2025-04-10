#!/bin/bash
set -e

cd /runner

# Configuration du runner si nécessaire
if [ ! -f ".runner" ]; then
  ./config.sh --unattended \
    --url https://github.com/johanldx/ecodeli-backend-nestjs \
    --token $GITHUB_TOKEN \
    --name $(hostname) \
    --work _work \
    --labels self-hosted,docker
fi

# Lance le runner
./run.sh