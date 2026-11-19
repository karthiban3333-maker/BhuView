# BhuView architecture

BhuView uses a parcel-centric monorepo. The React/Vite portal calls FastAPI through `/api`; FastAPI owns authentication, RBAC, workflows, document validation, AI analysis contracts, GIS analysis contracts, audit events and government-provider adapters. PostgreSQL/PostGIS is the durable target; the bundled mock provider and in-memory fixtures make the hackathon demo run without external credentials.

## Workflow

`DRAFT → SUBMITTED → UNDER_REVIEW → VERIFICATION_REQUIRED → DOCUMENT_REQUIRED → AI_FLAGGED → ESCALATED → APPROVED / REJECTED → COMPLETED`. Every transition is represented by a workflow-history row in the PostGIS schema and emits a notification plus audit event in the service layer.

## AI and documents

AI endpoints return an explainable detection, confidence, supporting records, reasons and a recommended human verification action. Document upload validates file type and size, then returns an OCR-shaped extraction payload for comparison. No AI response is a legally binding decision.

## GIS

Parcel geometries, utilities and environmental zones use PostGIS geometry columns and GiST indexes. Spatial analysis is designed for overlap, duplicate, proximity, land-use conflict and environmental restriction queries. The demo endpoint returns synthetic analysis evidence and keeps the provider label explicit.

## Government integration

`OfficialGovernmentProvider` and `MockGovernmentProvider` share the same adapter boundary. `DATA_PROVIDER=mock` is the safe default. The UI must label mock or cached responses as `DEMONSTRATION DATA`; no CAPTCHA-protected or undocumented endpoint is scraped.

## Current demo persistence decision

The current runnable prototype follows the honest in-memory path: FastAPI stores synthetic parcels, requests, notifications, mappings and audit events in process memory. They reset on API restart. The PostGIS schema and seed script remain reference materials for a future persistence implementation and are not wired into this demo. `docker-compose.yml` therefore runs only the API service and does not imply database persistence.
