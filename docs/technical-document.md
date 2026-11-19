# BhuView Technical Document

## Architecture

BhuView is a React/TypeScript SPA backed by FastAPI. The backend is the authorization and workflow boundary; the frontend is a role-aware presentation layer. PostgreSQL/PostGIS is the durable target, with a clearly labelled synthetic provider for the hackathon environment. The major modules are authentication, Parcel 360, workflow, GIS, document intelligence, AI risk, schema mapping, notifications and audit.

## Authentication and security

The demo uses password authentication followed by a six-digit mobile OTP challenge. The OTP is explicitly mocked and expires after five minutes with three-attempt lockout. Protected backend routes reject the pre-OTP token. Role and permissions come from the authenticated account, not a frontend role dropdown. CORS, environment-based secrets, file validation and role-scoped endpoint dependencies are configured in the API. Production deployment should add TLS, encrypted secret storage, rate limiting, CSRF controls for cookie sessions, object storage and managed identity/MFA.

## ULPIN and state schema mapping

ULPIN is the stable parcel identity used to join RoR, ownership, registration, encumbrance, zoning, tax, GIS and workflow records. State adapters map local terminology into the common schema. For example, Bihar `khesra_number` maps to `survey_no`, `raiyat_name` maps to `owner.name`, `area_decimal` maps to `area_record` with a decimal-acre-to-square-foot transform, and `jamabandi_no` maps to `ror.record_number`. Mapping proposals are rule-based mock suggestions with confidence values and remain `PENDING_APPROVAL` until an admin approves them.

## GIS standards

Synthetic parcel boundaries are valid WGS84 longitude/latitude polygons rendered with MapLibre GL against a public demo basemap. GeoJSON is the interchange format; PostGIS geometry columns use SRID 4326 and GiST indexes. Production spatial validation should enforce ring closure, polygon validity, overlap checks, duplicate identifiers, CRS consistency and geometry version history. The UI uses color-coded parcel risk, polygon selection and a real map control surface rather than percentage-positioned boxes.

## Audit and human-in-the-loop AI

Meaningful events are appended to a chained audit log. Each record contains actor, role, action, record identifier, timestamp, previous hash and SHA-256 hash. The Audit view can verify the chain and includes a labelled demo-only tamper test. AI is advisory: the explainable risk factors are derived from parcel fields such as area mismatch, encumbrance, dispute, flood zone and zoning conflict; human officers retain approval, rejection and escalation authority.

## UI/UX and color system

The existing Civic Atlas language is retained: navy navigation (`#0b223d`), blue primary actions (`#1e5e9e`), cyan GIS accents, white panels, thin cool-gray borders, Plus Jakarta Sans for UI text and DM Mono for IDs/status metadata. Responsive sidebar, cards, panels, badges, empty states, modal forms and source-provenance badges keep operational screens dense but legible.

## Deployment and scalability

The frontend builds to static `dist/` output and proxies `/api` to FastAPI in development. The API is containerized and can run behind a managed PostgreSQL/PostGIS database. Production should use immutable versioned assets, private/no-store API responses, paginated parcel and audit queries, asynchronous document/OCR jobs, object storage, Redis-backed rate limits/cache, WebSockets or a managed event bus for workflow notifications, and read replicas for analytics. `docker-compose.yml`, `.env.example`, `database/schema.sql` and `docs/DEPLOYMENT.md` provide the deployment baseline.
