#!/bin/bash
set -e

cd /runner

if [ -f "/runner/env/.env" ]; then
  echo "[INFO] Chargement du fichier .env..."
  export $(grep -v '^#' /runner/env/.env | xargs)
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "[ERREUR] GITHUB_TOKEN non défini. Abandon."
  exit 1
fi

if [ ! -f ".runner" ]; then
  echo "[INFO] Configuration du GitHub Actions runner..."
  ./config.sh --unattended \
    --url https://github.com/johanldx/ecodeli-backend-nestjs \
    --token "$GITHUB_TOKEN" \
    --name "$(hostname)" \
    --work _work \
    --labels self-hosted,docker
else
  echo "[INFO] Le runner est déjà configuré. Démarrage..."
fi

exec ./run.sh
