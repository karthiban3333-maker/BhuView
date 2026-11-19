# BhuView API

The prototype exposes a FastAPI contract under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health and data-source status |
| GET | `/api/parcels?q=` | Search the common parcel model |
| GET | `/api/parcels/{parcel_id}` | Parcel 360 connected evidence |
| POST | `/api/service-requests` | Create a citizen request and audit event |
| GET | `/api/ai/anomalies` | Demonstration anomaly queue |
| POST | `/api/ai/anomalies/{id}/flag` | Flag an anomaly for officer review |
| GET | `/api/gis/validation` | Geometry/data-quality results |
| GET | `/api/integrations` | Provider monitoring and provenance |
| GET | `/api/audit` | Audit events |

All responses use `{ success, data, meta? }`; errors use `{ success: false, error: { code, message } }`.

## Government data policy

This build uses a mock connector interface because publicly documented, credential-free live APIs for the required state land-record flows are not assumed. The interface is designed for an official adapter to be added behind the backend when one is available. The UI labels every provider as `DEMONSTRATION DATA`, `Mock provider`, or `Fallback`; it never presents synthetic records as authoritative government data.
