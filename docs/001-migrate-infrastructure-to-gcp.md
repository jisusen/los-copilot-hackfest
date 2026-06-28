# ADR-001: Migrate Infrastructure to Google Cloud Platform

**Status:** Draft  
**Date:** 2026-05-24  
**Author:** Solution Architecture  
**Squad Impacted:** All squads (Backend Service, BPMN Designer, Integration Service, Frontend, Common Lib)

---

## Context

ULOS currently runs via Docker Compose on a single host. This setup cannot support:

- **Production SLA**: No HA, no rolling updates, no auto-scaling for peak loan volume
- **Banking compliance**: No VPC isolation, no KMS-backed encryption, no audit logging infra
- **Team velocity**: 5 squads share 1 dev environment, blocking each other on integration tests
- **Disaster recovery**: Single point of failure — one host, one Postgres instance, no backups

The `infra/` directory holds the current local/dev manifests (K8s base + Keycloak + Postgres init + Prometheus). The `infra-setup/` directory already contains Terraform modules and GKE manifests prepared for GCP migration.

## Decision

**Migrate all ULOS infrastructure to Google Cloud Platform (GCP)** using the mapping below. Keep the monorepo structure — `infra/` for local Docker Compose dev, `infra-setup/` for GCP IaC and deployment config.

### Service Mapping

| Current (Docker Compose) | GCP Target | Rationale |
|---|---|---|
| PostgreSQL (shared host) | **Cloud SQL for PostgreSQL 15** | Managed HA, PITR backups, IAM auth, private IP |
| Kafka (single broker) | **Cloud Pub/Sub** + DLQ | Serverless, no broker ops, built-in DLQ, 60s ack deadline |
| Redis (single container) | **Memorystore for Redis 7** | VPC-native, HA tier, auto-failover |
| Keycloak (container) | **Keycloak on GKE** (keep self-hosted) | Complex RBAC (MAKER/CHECKER/ADMIN/VIEWER) + composite roles not portable to Cloud Identity |
| 7 Spring Boot services | **GKE Standard** (private cluster) | Node pool isolation, Workload Identity, rolling updates |
| React UI (vite dev) | **GKE (nginx container)** | Same artifact pipeline as backend, Cloud CDN later |
| Local volumes (BPMN/DMN) | **Cloud Storage** (3 buckets) | Versioned, KMS-encrypted, 90d lifecycle |
| Env vars (secrets) | **Secret Manager** + External Secrets Operator | Centralized, versioned, audit-logged |
| Prometheus (local) | **Managed Prometheus** (GKE Monitoring) | Native GKE integration, no self-hosted infra |
| Zipkin / logs | **Cloud Trace + Cloud Logging** | OTel-native, distributed tracing |

### Architecture Highlights

```
Internet → Cloud LB (SSL + Cloud Armor WAF) → GKE Ingress
  ├── api-gateway (Spring Cloud Gateway)
  ├── ulos-ui (nginx)
  └── keycloak
GKE private cluster → 3 node pools (default, workload, system)
  Services consume:
    ├── Cloud SQL (via Auth Proxy sidecar)
    ├── Memorystore (private IP)
    ├── Pub/Sub (Workload Identity auth)
    └── Secret Manager (via External Secrets Operator)
```

### Cluster Design

- **Type**: Standard (not Autopilot) — need taints/tolerations for workload isolation
- **Network**: Private cluster, no public node IPs, Cloud NAT for egress
- **Node Pools**:
  | Pool | Machine | Nodes | Taint | Workloads |
  |---|---|---|---|---|
  | default | e2-standard-4 | 2 | none | api-gateway, rule, iam, ui, notification |
  | workload | e2-standard-8 | 2 | `workload=heavy:NoSchedule` | orchestration, bpm-service, integration |
  | system | e2-standard-2 | 1 | `workload=system:NoSchedule` | ingress-controller, monitoring agents |

### Database Strategy

Single Cloud SQL Enterprise Plus instance, 2 databases, per-service schemas (same isolation pattern as current `infra/postgres/init/01-init.sh`):

| Database | Schemas |
|---|---|
| `ulos_orchestration` | `orchestration`, `flowable`, `rule`, `integration`, `audit` |
| `ulos_iam` | `iam` |

Connection via Cloud SQL Auth Proxy sidecar — no public IP, IAM-based auth.

### Messaging: Kafka → Pub/Sub

| Kafka Topic | Pub/Sub Topic | Subscriber |
|---|---|---|
| `process-start-requested` | `ulos.process.start` | orchestration-sub |
| `bpm-state-changed` | `ulos.bpm.state` | bpm-sub |
| `notification-triggered` | `ulos.notification` | notification-sub |

Requires refactoring `@KafkaListener` → Spring Cloud GCP Pub/Sub (`spring-cloud-gcp-starter-pubsub`).

## Consequences

### Positive

- **HA & Resilience**: Multi-zonal GKE, regional Cloud SQL, auto-scaled node pools
- **Banking compliance**: VPC Service Controls, KMS HSM (prod), Binary Authorization, Cloud Audit Logs, Cloud Armor WAF
- **Operational offload**: No Kafka/ZK ops, no Postgres patching, no Redis failover scripts
- **Observability**: Managed Prometheus, Cloud Trace, Cloud Logging — replaces self-hosted Zipkin/Prometheus
- **Environment isolation**: Terraform per environment (dev/staging/prod) with state locking
- **Cost control**: ~$740/mo dev, ~$2,330/mo prod — predictable via committed use discounts

### Negative

- **Code refactoring**: Replace `spring-kafka` with `spring-cloud-gcp-pubsub` in orchestration, bpm, notification services (~3 sprints)
- **Learning curve**: Squad unfamiliar with GCP services (Pub/Sub, Cloud SQL Auth Proxy, Workload Identity)
- **Lock-in risk**: Moving from Kafka to Pub/Sub couples us to GCP messaging; mitigable via Spring Cloud Stream abstraction
- **Keycloak left self-hosted**: One more K8s workload to maintain; acceptable for complex RBAC needs

### Migration Cost Estimate

| Item | Effort |
|---|---|
| Terraform infra provisioning | 1 sprint |
| Kafka → Pub/Sub refactor | 2 sprints |
| Containerization & GKE deploy | 2 sprints |
| Observability setup | 1 sprint |
| Security hardening | 1 sprint |
| Testing & cutover | 1 sprint |
| **Total** | **~8 weeks (2 months)** |

Detailed timeline in `infra-setup/docs/04-migration-checklist.md`.

## Decision Drivers

1. **POJK 11/2022, POJK 4/2023 compliance** — requires audit trails, data encryption, DR plan. GCP meets all.
2. **Scaling for peak loan volume** — GKE HPA (2→6 pods per service) handles month-end spikes.
3. **Multi-squad velocity** — per-environment isolation (dev/staging/prod) prevents blocking.
4. **Operational burden** — managed services reduce SRE headcount needed for Kafka/Postgres/Redis.

## Alternatives Considered

| Alternative | Rejected Because |
|---|---|
| **AWS** | Team has existing GCP org, no AWS competency in-house |
| **Azure** | No strategic partnership; GCP committed use discounts preferred |
| **Self-hosted K8s on-prem** | Requires dedicated infra team, contradicts bank cloud-first policy |
| **GKE Autopilot** | Cannot set taints/tolerations for workload isolation; no control over node upgrades |

## References

- `infra/` — Current local dev manifests
- `infra-setup/` — Terraform modules + GKE manifests for GCP
- `infra-setup/docs/01-gcp-infrastructure-overview.md`
- `infra-setup/docs/02-terraform-setup.md`
- `infra-setup/docs/03-gke-deployment-guide.md`
- `infra-setup/docs/04-migration-checklist.md`
- POJK 11/2022, POJK 4/2023 — OJK regulations for credit systems
