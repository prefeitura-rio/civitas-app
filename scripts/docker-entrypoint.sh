#!/bin/sh
# docker-entrypoint.sh
#
# Generates public/env-config.js with runtime public env vars so that
# client-side JavaScript can read them from window.__ENV__ without needing
# NEXT_PUBLIC_* values baked into the Docker image at build time.
#
# Values are injected into the pod's process environment by Infisical.
# JSON.stringify (via node) is used to safely escape all special characters.
set -e

echo "Generating /app/public/env-config.js..."

node - << 'EOF'
const fs = require('fs')

const env = {
  CIVITAS_API_URL:      process.env.CIVITAS_API_URL      ?? '',
  MAPBOX_ACCESS_TOKEN:  process.env.MAPBOX_ACCESS_TOKEN  ?? '',
  ENABLE_CHAMADOS:      process.env.ENABLE_CHAMADOS      ?? 'false',
  ENABLE_IMPERSONATION: process.env.ENABLE_IMPERSONATION ?? 'false',
  APP_URL:              process.env.APP_URL               ?? '',
}

const content = `// Generated at container startup by scripts/docker-entrypoint.sh — do not edit.\nwindow.__ENV__ = ${JSON.stringify(env, null, 2)};\n`

fs.writeFileSync('/app/public/env-config.js', content)
console.log('env-config.js written successfully.')
EOF

exec node server.js
