# Deployment

This stack runs as two Bun servers (LOS demo on `:3333`, dashboard on `:3003`) backed by a SQLite file. Any host that can run a long-lived Bun process with a persistent disk works — serverless and static-only platforms cannot run the full stack.

## Tested path

- **[Render](render/README.md)** — single combined container (`Dockerfile`, `render.yaml`, `start.sh`) with a persistent disk for the database. This is the configuration we deploy and test.

## Other options

| Guide | Notes |
|---|---|
| [Railway](railway/README.md) | Docker deploy with a persistent volume |
| [Fly.io](flyio/README.md) | Fly Machines + volume |
| [AWS](aws/README.md) | EC2 free tier / Lightsail |
| [GCP](gcp/README.md) | Compute Engine VM — see also `docs/001-migrate-infrastructure-to-gcp.md` and `docs/adr/ADR-001-gcp-migration.md` |

Sharing a local demo: `cloudflared tunnel --url http://localhost:3003` or `ngrok http 3003`.

## Host requirements

- Bun v1.1+
- A persistent disk for `data/los.db` (ephemeral filesystems lose the demo data on every deploy)
- Outbound network access to your LLM provider
- Python 3.11+ *only* if you want real browser extraction (`MOCK_AGENT=false`)
