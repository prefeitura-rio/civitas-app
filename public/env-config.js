/**
 * Runtime public environment configuration.
 *
 * IN PRODUCTION: this file is generated at container startup by
 * scripts/docker-entrypoint.sh, which reads values from the pod's process
 * environment (injected by Infisical) and writes them here as JSON.
 * The values below are overwritten at every container start — do not edit manually.
 *
 * IN LOCAL DEVELOPMENT: this file defines an empty window.__ENV__ object.
 * src/lib/public-env.ts then falls back to Next.js's static NEXT_PUBLIC_*
 * replacements, which are read from .env.local at dev-server startup.
 * No action needed for local dev — just keep your .env.local up to date.
 *
 * DO NOT commit real tokens or secrets here.
 */
window.__ENV__ = {};
