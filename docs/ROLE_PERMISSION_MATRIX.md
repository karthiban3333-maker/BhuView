# Role and permission matrix

| Capability | Citizen | Revenue | Registration | Planning | GIS | Head | Data Admin | System Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| View own parcel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Verify ownership / RoR | — | ✓ | View | View | — | ✓ | — | — |
| Registration / encumbrance | View | View | ✓ | View | — | ✓ | — | — |
| Zoning / land use | View | View | View | ✓ | ✓ | ✓ | — | — |
| GIS editing / imports | — | — | — | — | ✓ | View | ✓ | ✓ |
| Service requests | Create own | Process | Process | Review | — | Approve | — | — |
| AI alerts / risk | — | ✓ | ✓ | View | View | ✓ | View | View |
| User / role management | — | — | — | — | — | — | — | ✓ |
| API / data-source management | — | — | — | — | — | — | ✓ | ✓ |
| Audit logs | Own | Relevant | Relevant | Relevant | Relevant | ✓ | ✓ | ✓ |

The backend enforces these permissions on protected routes; frontend navigation is not the security boundary.
