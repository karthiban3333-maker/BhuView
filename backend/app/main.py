from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Optional
from threading import Lock
import base64, hashlib, hmac, json, os, uuid, random
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SECRET = os.getenv('JWT_SECRET', 'bhuview-demo-secret-change-me')
app = FastAPI(title='BhuView API', version='0.2.0', description='Authenticated parcel-centric land governance API')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS', '*').split(','), allow_methods=['*'], allow_headers=['*'])

ROLES = ['citizen','revenue_officer','registration_officer','planning_officer','gis_officer','department_head','data_admin','system_admin']
USERS = {
 'citizen@demo.gov': {'name':'Meenakshi R.', 'role':'citizen'}, 'revenue@demo.gov': {'name':'R. Prakash', 'role':'revenue_officer'},
 'registration@demo.gov': {'name':'S. Anitha', 'role':'registration_officer'}, 'planning@demo.gov': {'name':'K. Senthil', 'role':'planning_officer'},
 'gis@demo.gov': {'name':'V. Hari', 'role':'gis_officer'}, 'head@demo.gov': {'name':'A. Raman', 'role':'department_head'},
 'dataadmin@demo.gov': {'name':'N. Kavya', 'role':'data_admin'}, 'admin@demo.gov': {'name':'System Admin', 'role':'system_admin'},
}
DEMO_PASSWORD = os.getenv('DEMO_PASSWORD', 'BhuView@2026')
PERMISSIONS = {
 'citizen': {'VIEW_OWN_PARCEL','CREATE_SERVICE_REQUEST','UPLOAD_DOCUMENT','VIEW_OWN_NOTIFICATIONS'},
 'revenue_officer': {'VIEW_PARCEL','VERIFY_OWNERSHIP','VERIFY_ROR','VIEW_DOCUMENTS','APPROVE_APPLICATION','REJECT_APPLICATION','ESCALATE_CASE','VIEW_AI_ALERTS'},
 'registration_officer': {'VIEW_PARCEL','VIEW_REGISTRATION','VERIFY_ENCUMBRANCE','VIEW_DOCUMENTS','APPROVE_APPLICATION','REJECT_APPLICATION','ESCALATE_CASE','VIEW_AI_ALERTS'},
 'planning_officer': {'VIEW_PARCEL','VIEW_ZONING','VIEW_LAND_USE','VERIFY_BUILDING_PERMISSION','VIEW_GIS_ANALYSIS','VIEW_DOCUMENTS'},
 'gis_officer': {'VIEW_PARCEL','MANAGE_GIS','IMPORT_DATA','RUN_SPATIAL_ANALYSIS','VIEW_GIS_REPORTS','VIEW_AI_ALERTS','ESCALATE_CASE'},
 'department_head': {'VIEW_PARCEL','VIEW_ANALYTICS','APPROVE_APPLICATION','REJECT_APPLICATION','ESCALATE_CASE','VIEW_AUDIT_LOG'},
 'data_admin': {'VIEW_INTEGRATIONS','MANAGE_API','IMPORT_DATA','VIEW_AUDIT_LOG','VIEW_ANALYTICS'},
 'system_admin': {'MANAGE_USERS','MANAGE_ROLES','MANAGE_API','VIEW_AUDIT_LOG','VIEW_ANALYTICS','VIEW_INTEGRATIONS','MANAGE_SETTINGS'},
}
random.seed(20260929)
PARCELS = [
  {
    "id": "P-0001",
    "ulpin": "TN-07-23-001-0001",
    "survey": "S.No. 101/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "10,224 sq.ft",
    "land_use": "Agricultural",
    "risk": "High",
    "area_mismatch": True,
    "open_encumbrance": True,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": True,
    "same_owner_conflict": False,
    "application_open": True,
    "priority_score": 31,
    "updated_year": 2019,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191845,
            12.926935
          ],
          [
            80.192079,
            12.927013
          ],
          [
            80.191985,
            12.927317
          ],
          [
            80.191753,
            12.927247
          ],
          [
            80.191845,
            12.926935
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0002",
    "ulpin": "TN-07-23-001-0002",
    "survey": "S.No. 102/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "12,909 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": True,
    "application_open": False,
    "priority_score": 7,
    "updated_year": 2020,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187434,
            12.914044
          ],
          [
            80.187687,
            12.913995
          ],
          [
            80.187753,
            12.91437
          ],
          [
            80.187481,
            12.914407
          ],
          [
            80.187434,
            12.914044
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0003",
    "ulpin": "TN-07-23-001-0003",
    "survey": "S.No. 103/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "10,872 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 18,
    "updated_year": 2021,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204979,
            12.933968
          ],
          [
            80.20526,
            12.934085
          ],
          [
            80.205172,
            12.93434
          ],
          [
            80.204883,
            12.934225
          ],
          [
            80.204979,
            12.933968
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0004",
    "ulpin": "TN-07-23-001-0004",
    "survey": "S.No. 104/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": "33AABCU9603R1Z5",
    "area": "14,070 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 9,
    "updated_year": 2022,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197604,
            12.896954
          ],
          [
            80.197934,
            12.896977
          ],
          [
            80.197916,
            12.897308
          ],
          [
            80.19758,
            12.897269
          ],
          [
            80.197604,
            12.896954
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0005",
    "ulpin": "TN-07-23-001-0005",
    "survey": "S.No. 105/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "9,138 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 10,
    "updated_year": 2023,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024289,
            12.78913
          ],
          [
            80.024485,
            12.789067
          ],
          [
            80.024595,
            12.789414
          ],
          [
            80.024404,
            12.789451
          ],
          [
            80.024289,
            12.78913
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0006",
    "ulpin": "TN-07-23-001-0006",
    "survey": "S.No. 106/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "9,043 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 21,
    "updated_year": 2024,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.192177,
            12.927032
          ],
          [
            80.192399,
            12.927104
          ],
          [
            80.192313,
            12.927375
          ],
          [
            80.192083,
            12.92733
          ],
          [
            80.192177,
            12.927032
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0007",
    "ulpin": "TN-07-23-001-0007",
    "survey": "S.No. 107/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "10,852 sq.ft",
    "land_use": "Commercial",
    "risk": "High",
    "area_mismatch": False,
    "open_encumbrance": True,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": True,
    "boundary_overlap": True,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 30,
    "updated_year": 2025,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187754,
            12.914015
          ],
          [
            80.188028,
            12.913978
          ],
          [
            80.188079,
            12.914278
          ],
          [
            80.187827,
            12.914329
          ],
          [
            80.187754,
            12.914015
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0008",
    "ulpin": "TN-07-23-001-0008",
    "survey": "S.No. 108/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "14,465 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 6,
    "updated_year": 2026,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.205253,
            12.934033
          ],
          [
            80.205541,
            12.934145
          ],
          [
            80.205404,
            12.934474
          ],
          [
            80.20511,
            12.93436
          ],
          [
            80.205253,
            12.934033
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0009",
    "ulpin": "TN-07-23-001-0009",
    "survey": "S.No. 109/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "13,379 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 17,
    "updated_year": 2018,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197946,
            12.897005
          ],
          [
            80.198294,
            12.897035
          ],
          [
            80.198263,
            12.897323
          ],
          [
            80.197919,
            12.897308
          ],
          [
            80.197946,
            12.897005
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0010",
    "ulpin": "TN-07-23-001-0010",
    "survey": "S.No. 110/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "8,338 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 8,
    "updated_year": 2019,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024634,
            12.789045
          ],
          [
            80.024811,
            12.78897
          ],
          [
            80.024915,
            12.789281
          ],
          [
            80.024725,
            12.789354
          ],
          [
            80.024634,
            12.789045
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0011",
    "ulpin": "TN-07-23-001-0011",
    "survey": "S.No. 111/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "11,506 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 9,
    "updated_year": 2020,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191765,
            12.927347
          ],
          [
            80.192004,
            12.927407
          ],
          [
            80.191897,
            12.927756
          ],
          [
            80.191669,
            12.92771
          ],
          [
            80.191765,
            12.927347
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0012",
    "ulpin": "TN-07-23-001-0012",
    "survey": "S.No. 112/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "9,954 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": True,
    "application_open": False,
    "priority_score": 20,
    "updated_year": 2021,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187468,
            12.914503
          ],
          [
            80.18772,
            12.914469
          ],
          [
            80.187777,
            12.914755
          ],
          [
            80.187506,
            12.91479
          ],
          [
            80.187468,
            12.914503
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0013",
    "ulpin": "TN-07-23-001-0013",
    "survey": "S.No. 113/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "12,365 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 11,
    "updated_year": 2022,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204802,
            12.934343
          ],
          [
            80.20507,
            12.934447
          ],
          [
            80.204957,
            12.934744
          ],
          [
            80.204671,
            12.934642
          ],
          [
            80.204802,
            12.934343
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0014",
    "ulpin": "TN-07-23-001-0014",
    "survey": "S.No. 114/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "15,340 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 5,
    "updated_year": 2023,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197618,
            12.897379
          ],
          [
            80.19793,
            12.897393
          ],
          [
            80.197911,
            12.897758
          ],
          [
            80.197578,
            12.897743
          ],
          [
            80.197618,
            12.897379
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0015",
    "ulpin": "TN-07-23-001-0015",
    "survey": "S.No. 115/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "7,596 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 16,
    "updated_year": 2024,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024482,
            12.789559
          ],
          [
            80.024662,
            12.789499
          ],
          [
            80.024766,
            12.789772
          ],
          [
            80.024555,
            12.78983
          ],
          [
            80.024482,
            12.789559
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0016",
    "ulpin": "TN-07-23-001-0016",
    "survey": "S.No. 116/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "10,162 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 7,
    "updated_year": 2025,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.192031,
            12.927426
          ],
          [
            80.192259,
            12.927483
          ],
          [
            80.192169,
            12.9278
          ],
          [
            80.191941,
            12.927754
          ],
          [
            80.192031,
            12.927426
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0017",
    "ulpin": "TN-07-23-001-0017",
    "survey": "S.No. 117/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "13,071 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 8,
    "updated_year": 2026,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.1878,
            12.914416
          ],
          [
            80.188069,
            12.914373
          ],
          [
            80.188116,
            12.914744
          ],
          [
            80.18785,
            12.914782
          ],
          [
            80.1878,
            12.914416
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0018",
    "ulpin": "TN-07-23-001-0018",
    "survey": "S.No. 118/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "11,559 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 19,
    "updated_year": 2018,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.205091,
            12.934484
          ],
          [
            80.205385,
            12.934583
          ],
          [
            80.205277,
            12.93485
          ],
          [
            80.204985,
            12.934752
          ],
          [
            80.205091,
            12.934484
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0019",
    "ulpin": "TN-07-23-001-0019",
    "survey": "S.No. 119/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "14,204 sq.ft",
    "land_use": "Commercial",
    "risk": "High",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": True,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 35,
    "updated_year": 2019,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197942,
            12.897434
          ],
          [
            80.198269,
            12.897447
          ],
          [
            80.198253,
            12.897784
          ],
          [
            80.197914,
            12.89775
          ],
          [
            80.197942,
            12.897434
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0020",
    "ulpin": "TN-07-23-001-0020",
    "survey": "S.No. 120/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "9,732 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 11,
    "updated_year": 2020,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024718,
            12.789435
          ],
          [
            80.024922,
            12.789395
          ],
          [
            80.025024,
            12.789741
          ],
          [
            80.024829,
            12.789791
          ],
          [
            80.024718,
            12.789435
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0021",
    "ulpin": "TN-07-23-001-0021",
    "survey": "S.No. 121/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "8,550 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 15,
    "updated_year": 2021,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.19163,
            12.927788
          ],
          [
            80.191837,
            12.927863
          ],
          [
            80.191782,
            12.928134
          ],
          [
            80.19155,
            12.928075
          ],
          [
            80.19163,
            12.927788
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0022",
    "ulpin": "TN-07-23-001-0022",
    "survey": "S.No. 122/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "10,434 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 6,
    "updated_year": 2022,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187553,
            12.91491
          ],
          [
            80.187817,
            12.91489
          ],
          [
            80.187868,
            12.91519
          ],
          [
            80.187624,
            12.915228
          ],
          [
            80.187553,
            12.91491
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0023",
    "ulpin": "TN-07-23-001-0023",
    "survey": "S.No. 123/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "14,323 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 7,
    "updated_year": 2023,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204674,
            12.934716
          ],
          [
            80.204951,
            12.934846
          ],
          [
            80.204784,
            12.93517
          ],
          [
            80.204517,
            12.935058
          ],
          [
            80.204674,
            12.934716
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0024",
    "ulpin": "TN-07-23-001-0024",
    "survey": "S.No. 124/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "12,934 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 18,
    "updated_year": 2024,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.19752,
            12.897822
          ],
          [
            80.197863,
            12.897878
          ],
          [
            80.197825,
            12.898154
          ],
          [
            80.197498,
            12.898133
          ],
          [
            80.19752,
            12.897822
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0025",
    "ulpin": "TN-07-23-001-0025",
    "survey": "S.No. 125/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "9,062 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 9,
    "updated_year": 2025,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024554,
            12.789955
          ],
          [
            80.024756,
            12.789905
          ],
          [
            80.024849,
            12.79022
          ],
          [
            80.024651,
            12.790283
          ],
          [
            80.024554,
            12.789955
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0026",
    "ulpin": "TN-07-23-001-0026",
    "survey": "S.No. 126/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "10,394 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 10,
    "updated_year": 2026,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191967,
            12.927842
          ],
          [
            80.192177,
            12.927911
          ],
          [
            80.192096,
            12.928238
          ],
          [
            80.191868,
            12.928202
          ],
          [
            80.191967,
            12.927842
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0027",
    "ulpin": "TN-07-23-001-0027",
    "survey": "S.No. 127/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "9,952 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 21,
    "updated_year": 2018,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187896,
            12.914882
          ],
          [
            80.188154,
            12.914842
          ],
          [
            80.188198,
            12.91513
          ],
          [
            80.187941,
            12.915174
          ],
          [
            80.187896,
            12.914882
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0028",
    "ulpin": "TN-07-23-001-0028",
    "survey": "S.No. 128/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "13,755 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 5,
    "updated_year": 2019,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204908,
            12.93483
          ],
          [
            80.205185,
            12.934964
          ],
          [
            80.205055,
            12.935266
          ],
          [
            80.204761,
            12.935146
          ],
          [
            80.204908,
            12.93483
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0029",
    "ulpin": "TN-07-23-001-0029",
    "survey": "S.No. 129/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "14,983 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 6,
    "updated_year": 2020,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197861,
            12.897842
          ],
          [
            80.198211,
            12.89788
          ],
          [
            80.198156,
            12.898216
          ],
          [
            80.197844,
            12.898196
          ],
          [
            80.197861,
            12.897842
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0030",
    "ulpin": "TN-07-23-001-0030",
    "survey": "S.No. 130/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "7,810 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 17,
    "updated_year": 2021,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024889,
            12.78989
          ],
          [
            80.025088,
            12.789809
          ],
          [
            80.025178,
            12.790106
          ],
          [
            80.024991,
            12.790152
          ],
          [
            80.024889,
            12.78989
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0031",
    "ulpin": "TN-07-23-001-0031",
    "survey": "S.No. 131/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "10,050 sq.ft",
    "land_use": "Commercial",
    "risk": "High",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": True,
    "zoning_conflict": True,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 33,
    "updated_year": 2022,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191547,
            12.928221
          ],
          [
            80.191777,
            12.928252
          ],
          [
            80.191693,
            12.928586
          ],
          [
            80.191457,
            12.928511
          ],
          [
            80.191547,
            12.928221
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0032",
    "ulpin": "TN-07-23-001-0032",
    "survey": "S.No. 132/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "12,278 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 9,
    "updated_year": 2023,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187575,
            12.91532
          ],
          [
            80.187853,
            12.915288
          ],
          [
            80.187899,
            12.915639
          ],
          [
            80.187654,
            12.915675
          ],
          [
            80.187575,
            12.91532
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0033",
    "ulpin": "TN-07-23-001-0033",
    "survey": "S.No. 133/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "12,112 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 20,
    "updated_year": 2024,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204434,
            12.93514
          ],
          [
            80.204734,
            12.935252
          ],
          [
            80.204612,
            12.935531
          ],
          [
            80.204333,
            12.935418
          ],
          [
            80.204434,
            12.93514
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0034",
    "ulpin": "TN-07-23-001-0034",
    "survey": "S.No. 134/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "14,730 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 11,
    "updated_year": 2025,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197512,
            12.898258
          ],
          [
            80.197849,
            12.898271
          ],
          [
            80.197826,
            12.898604
          ],
          [
            80.19748,
            12.898586
          ],
          [
            80.197512,
            12.898258
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0035",
    "ulpin": "TN-07-23-001-0035",
    "survey": "S.No. 135/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "9,659 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 5,
    "updated_year": 2026,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024711,
            12.790346
          ],
          [
            80.024902,
            12.790283
          ],
          [
            80.025032,
            12.790638
          ],
          [
            80.024832,
            12.790682
          ],
          [
            80.024711,
            12.790346
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0036",
    "ulpin": "TN-07-23-001-0036",
    "survey": "S.No. 136/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "9,054 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 16,
    "updated_year": 2018,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191794,
            12.928285
          ],
          [
            80.192043,
            12.928344
          ],
          [
            80.191959,
            12.928621
          ],
          [
            80.191736,
            12.928563
          ],
          [
            80.191794,
            12.928285
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0037",
    "ulpin": "TN-07-23-001-0037",
    "survey": "S.No. 137/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "11,065 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 7,
    "updated_year": 2019,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187926,
            12.91529
          ],
          [
            80.188187,
            12.915252
          ],
          [
            80.188231,
            12.915574
          ],
          [
            80.187985,
            12.915622
          ],
          [
            80.187926,
            12.91529
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0038",
    "ulpin": "TN-07-23-001-0038",
    "survey": "S.No. 138/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "14,906 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 8,
    "updated_year": 2020,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204764,
            12.935238
          ],
          [
            80.205051,
            12.935364
          ],
          [
            80.204909,
            12.93569
          ],
          [
            80.204612,
            12.935577
          ],
          [
            80.204764,
            12.935238
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0039",
    "ulpin": "TN-07-23-001-0039",
    "survey": "S.No. 139/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "12,948 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 19,
    "updated_year": 2021,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197853,
            12.898299
          ],
          [
            80.198198,
            12.898335
          ],
          [
            80.198166,
            12.898634
          ],
          [
            80.197838,
            12.898586
          ],
          [
            80.197853,
            12.898299
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0040",
    "ulpin": "TN-07-23-001-0040",
    "survey": "S.No. 140/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "9,154 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 10,
    "updated_year": 2022,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024974,
            12.790294
          ],
          [
            80.025189,
            12.790227
          ],
          [
            80.025286,
            12.79054
          ],
          [
            80.025095,
            12.790604
          ],
          [
            80.024974,
            12.790294
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0041",
    "ulpin": "TN-07-23-001-0041",
    "survey": "S.No. 141/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "11,380 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 11,
    "updated_year": 2023,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191395,
            12.928607
          ],
          [
            80.191641,
            12.928655
          ],
          [
            80.191548,
            12.929001
          ],
          [
            80.191305,
            12.928934
          ],
          [
            80.191395,
            12.928607
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0042",
    "ulpin": "TN-07-23-001-0042",
    "survey": "S.No. 142/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "9,624 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 15,
    "updated_year": 2024,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.187706,
            12.915784
          ],
          [
            80.187948,
            12.915747
          ],
          [
            80.188,
            12.916026
          ],
          [
            80.187742,
            12.916081
          ],
          [
            80.187706,
            12.915784
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0043",
    "ulpin": "TN-07-23-001-0043",
    "survey": "S.No. 143/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "12,239 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 6,
    "updated_year": 2025,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204304,
            12.935541
          ],
          [
            80.204594,
            12.935656
          ],
          [
            80.204461,
            12.935942
          ],
          [
            80.204191,
            12.935826
          ],
          [
            80.204304,
            12.935541
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0044",
    "ulpin": "TN-07-23-001-0044",
    "survey": "S.No. 144/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "16,141 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 7,
    "updated_year": 2026,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.197439,
            12.89867
          ],
          [
            80.197782,
            12.898685
          ],
          [
            80.197747,
            12.899049
          ],
          [
            80.197391,
            12.89901
          ],
          [
            80.197439,
            12.89867
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0045",
    "ulpin": "TN-07-23-001-0045",
    "survey": "S.No. 145/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "7,623 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 18,
    "updated_year": 2018,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.024841,
            12.790805
          ],
          [
            80.025019,
            12.79074
          ],
          [
            80.025118,
            12.791026
          ],
          [
            80.024906,
            12.791073
          ],
          [
            80.024841,
            12.790805
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0046",
    "ulpin": "TN-07-23-001-0046",
    "survey": "S.No. 146/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Arun Kumar",
    "gst": None,
    "area": "10,325 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 9,
    "updated_year": 2019,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.191729,
            12.928698
          ],
          [
            80.19197,
            12.928751
          ],
          [
            80.191878,
            12.929063
          ],
          [
            80.191643,
            12.929016
          ],
          [
            80.191729,
            12.928698
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0047",
    "ulpin": "TN-07-23-001-0047",
    "survey": "S.No. 147/1",
    "village": "Medavakkam",
    "taluk": "Tambaram",
    "owner": "Lakshmi Devi",
    "gst": None,
    "area": "12,683 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 10,
    "updated_year": 2020,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.188038,
            12.915691
          ],
          [
            80.188305,
            12.915655
          ],
          [
            80.188346,
            12.916032
          ],
          [
            80.188086,
            12.916046
          ],
          [
            80.188038,
            12.915691
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0048",
    "ulpin": "TN-07-23-001-0048",
    "survey": "S.No. 148/1",
    "village": "Pallikaranai",
    "taluk": "Tambaram",
    "owner": "Suresh B.",
    "gst": None,
    "area": "11,451 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 21,
    "updated_year": 2021,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.204557,
            12.935653
          ],
          [
            80.204827,
            12.935778
          ],
          [
            80.204716,
            12.936039
          ],
          [
            80.204432,
            12.935927
          ],
          [
            80.204557,
            12.935653
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0049",
    "ulpin": "TN-07-23-001-0049",
    "survey": "S.No. 149/1",
    "village": "Perumbakkam",
    "taluk": "Tambaram",
    "owner": "Kavitha S.",
    "gst": None,
    "area": "13,568 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 5,
    "updated_year": 2022,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.19778,
            12.898711
          ],
          [
            80.198106,
            12.898735
          ],
          [
            80.198089,
            12.899057
          ],
          [
            80.19776,
            12.899023
          ],
          [
            80.19778,
            12.898711
          ]
        ]
      ]
    }
  },
  {
    "id": "P-0050",
    "ulpin": "TN-07-23-001-0050",
    "survey": "S.No. 150/1",
    "village": "Maraimalai Nagar",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": None,
    "area": "9,768 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": False,
    "open_encumbrance": False,
    "active_dispute": False,
    "flood_zone": False,
    "zoning_conflict": False,
    "boundary_overlap": False,
    "same_owner_conflict": False,
    "application_open": False,
    "priority_score": 6,
    "updated_year": 2023,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            80.025149,
            12.790661
          ],
          [
            80.02535,
            12.790613
          ],
          [
            80.025445,
            12.790973
          ],
          [
            80.02525,
            12.791015
          ],
          [
            80.025149,
            12.790661
          ]
        ]
      ]
    }
  }
]

AUDIT: list[dict[str, Any]] = []
AUDIT_LOCK = Lock()
REQUESTS: list[dict[str, Any]] = [{'id':'SR-2026-0047','parcel_id':'P-0001','request_type':'Certificate of ownership','status':'SUBMITTED','created_at':'2026-09-29T10:42:00Z','owner':'citizen@demo.gov'}]
NOTIFICATIONS: list[dict[str, Any]] = []
OTP_CHALLENGES: dict[str, dict[str, Any]] = {}
SCHEMA_MAPPINGS: list[dict[str, Any]] = []
PLANNING_SCENARIOS: list[dict[str, Any]] = []

class LoginRequest(BaseModel): email: str; password: str
class ServiceRequest(BaseModel): parcel_id: str; request_type: str; description: str = ''
class WorkflowTransition(BaseModel): status: str = Field(pattern='^(UNDER_REVIEW|VERIFICATION_REQUIRED|DOCUMENT_REQUIRED|AI_FLAGGED|ESCALATED|APPROVED|REJECTED|COMPLETED)$'); remarks: str = ''
class NlSearch(BaseModel): query: str
class RiskRequest(BaseModel): parcel_id: str
class OtpRequest(BaseModel): challenge_id: str; code: str
class SchemaProposal(BaseModel): state: str; sample: dict[str, Any]
class SchemaApproval(BaseModel): mapping_id: str


def now(): return datetime.now(timezone.utc).isoformat()
def encode(payload: dict) -> str:
    raw = json.dumps(payload, separators=(',', ':')).encode(); body = base64.urlsafe_b64encode(raw).decode().rstrip('='); sig = hmac.new(SECRET.encode(), body.encode(), hashlib.sha256).digest(); return body + '.' + base64.urlsafe_b64encode(sig).decode().rstrip('=')
def decode(token: str) -> dict:
    try:
        body, sig = token.split('.'); expected = base64.urlsafe_b64encode(hmac.new(SECRET.encode(), body.encode(), hashlib.sha256).digest()).decode().rstrip('=')
        if not hmac.compare_digest(sig, expected): raise ValueError
        return json.loads(base64.urlsafe_b64decode(body + '=' * (-len(body)%4)))
    except Exception as exc: raise HTTPException(401, detail={'success':False,'error':{'code':'INVALID_TOKEN','message':'Authentication required'}}) from exc

def current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith('Bearer '): raise HTTPException(401, detail={'success':False,'error':{'code':'AUTH_REQUIRED','message':'Sign in to continue'}})
    payload = decode(authorization[7:])
    if payload.get('otp_verified') is False: raise HTTPException(401, detail={'success':False,'error':{'code':'OTP_REQUIRED','message':'Complete mobile verification before accessing the portal'}})
    return payload
def require(*permissions):
    def dependency(authorization: Optional[str] = Header(default=None)):
        user = current_user(authorization)
        if not set(permissions).issubset(PERMISSIONS.get(user['role'], set())): raise HTTPException(403, detail={'success':False,'error':{'code':'FORBIDDEN','message':'Your role is not permitted to perform this action'}})
        return user
    return dependency

def audit(user: dict, action: str, module: str, record_id: str, status='SUCCESS', previous=None, new=None):
    with AUDIT_LOCK:
        previous_hash = AUDIT[0]['hash'] if AUDIT else 'GENESIS'
        event_id = str(uuid.uuid4()); material = previous_hash + event_id + user['email'] + user['role'] + action
        AUDIT.insert(0, {'id':event_id,'ts':now(),'actor':user['email'],'role':user['role'],'action':action,'module':module,'record_id':record_id,'status':status,'previous_value':previous,'new_value':new,'prevHash':previous_hash,'hash':hashlib.sha256(material.encode()).hexdigest()})

def parcel_or_404(parcel_id):
    parcel = next((p for p in PARCELS if p['id'] == parcel_id or p['ulpin'] == parcel_id), None)
    if not parcel: raise HTTPException(404, detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    return parcel

DASHBOARD_WIDGETS = {
 'citizen': ['my_parcels','application_tracker','notifications','start_service','my_parcel_map'],
 'revenue_officer': ['assigned_cases','mutation_requests','area_mismatch_alerts','request_sla','cases_map'],
 'registration_officer': ['pending_registrations','encumbrance_queue','registration_ror_mismatches','document_review'],
 'planning_officer': ['building_applications','zoning_conflicts','flood_zone_parcels','planning_shortcut','zoning_map'],
 'gis_officer': ['data_quality','geometry_errors','import_jobs','layer_health'],
 'department_head': ['requests_by_status','priority_clusters','escalations','department_performance'],
 'data_admin': ['integration_health','mapping_approvals','import_jobs','quality_trend'],
 'system_admin': ['users_roles','system_health','audit_chain','security_events'],
}
def _dashboard_payload(role, email):
    widgets=DASHBOARD_WIDGETS.get(role)
    if not widgets: raise HTTPException(403,detail={'success':False,'error':{'code':'FORBIDDEN','message':'No dashboard is configured for this role'}})
    owned=[p for p in PARCELS if p['owner']=='Meenakshi R.']
    open_requests=[r for r in REQUESTS if r['status'] not in {'COMPLETED','REJECTED'}]
    conflicts=_conflicts()
    role_data={
      'citizen': {'my_parcels':owned,'application_tracker':[r for r in REQUESTS if r.get('owner')==email],'notifications':[n for n in NOTIFICATIONS if 'citizen' in n.get('recipient_roles',[])],'start_service':{'available':True},'my_parcel_map':owned},
      'revenue_officer': {'assigned_cases':open_requests,'mutation_requests':[r for r in open_requests if 'mutation' in r.get('request_type','').lower()],'area_mismatch_alerts':[p for p in PARCELS if p.get('area_mismatch')],'request_sla':{'open':len(open_requests),'older_than_48h':sum(1 for r in open_requests if r.get('status') in {'ESCALATED','VERIFICATION_REQUIRED'})},'cases_map':[p for p in PARCELS if p.get('area_mismatch') or p.get('open_encumbrance')]},
      'registration_officer': {'pending_registrations':[r for r in open_requests if 'registration' in r.get('request_type','').lower() or r['status'] not in {'COMPLETED','REJECTED'}],'encumbrance_queue':[p for p in PARCELS if p.get('open_encumbrance')],'registration_ror_mismatches':[p for p in PARCELS if p.get('area_mismatch')],'document_review':[r for r in open_requests if r.get('status') in {'SUBMITTED','DOCUMENT_REQUIRED'}]},
      'planning_officer': {'building_applications':[r for r in open_requests if 'building' in r.get('request_type','').lower()],'zoning_conflicts':[p for p in PARCELS if p.get('zoning_conflict')],'flood_zone_parcels':[p for p in PARCELS if p.get('flood_zone')],'planning_shortcut':{'available':True},'zoning_map':[p for p in PARCELS if p.get('zoning_conflict') or p.get('flood_zone')]},
      'gis_officer': {'data_quality':{'score':round(100*(1-len([p for p in PARCELS if p.get('area_mismatch') or p.get('boundary_overlap')])/max(len(PARCELS),1)),1),'total_features':len(PARCELS)},'geometry_errors':[p for p in PARCELS if p.get('boundary_overlap')],'import_jobs':[{'id':'IMP-DEMO-001','status':'COMPLETED','label':'DEMONSTRATION DATA'}],'layer_health':[{'name':'Cadastral parcels','status':'Healthy'},{'name':'Risk areas','status':'Healthy'},{'name':'Utilities','status':'Demo layer'}]},
      'department_head': {'requests_by_status':{status:sum(1 for r in REQUESTS if r['status']==status) for status in sorted({r['status'] for r in REQUESTS})},'priority_clusters':conflicts[:5],'escalations':[r for r in REQUESTS if r['status']=='ESCALATED'],'department_performance':{'open_requests':len(open_requests),'completed_requests':sum(1 for r in REQUESTS if r['status']=='COMPLETED')}},
      'data_admin': {'integration_health':[{'name':'Land records','status':'Connected'},{'name':'Registration','status':'Fallback'},{'name':'GIS service','status':'Connected'}],'mapping_approvals':[m for m in SCHEMA_MAPPINGS if m.get('status')=='PENDING_APPROVAL'],'import_jobs':[{'id':'IMP-DEMO-001','status':'COMPLETED','label':'DEMONSTRATION DATA'}],'quality_trend':[{'year':2024,'score':91.1},{'year':2025,'score':92.7},{'year':2026,'score':94.2}]},
      'system_admin': {'users_roles':[{'role':r,'users':sum(1 for u in USERS.values() if u['role']==r)} for r in ROLES],'system_health':{'status':'operational','api':'healthy','data_source':'DEMONSTRATION DATA'},'audit_chain':{'entries':len(AUDIT)},'security_events':[e for e in AUDIT if e.get('module') in {'auth','users','security'}][:10]},
    }
    return {'role':role,'widgets':widgets,'data':role_data[role],'label':'DEMONSTRATION DATA'}
@app.get('/api/dashboard')
def dashboard(user=Depends(current_user)):
    payload=_dashboard_payload(user.get('role',''),user.get('email',''))
    audit(user,'view_role_dashboard','dashboard',user.get('role','unknown'))
    return {'success':True,'data':payload}

@app.get('/api/health')
def health(): return {'success':True,'status':'ok','data_source':os.getenv('DATA_PROVIDER','mock'),'timestamp':now()}
@app.post('/api/auth/login')
def login(req: LoginRequest):
    user = USERS.get(req.email.lower())
    if not user or req.password != DEMO_PASSWORD: raise HTTPException(401, detail={'success':False,'error':{'code':'INVALID_CREDENTIALS','message':'Email or password is incorrect'}})
    payload = {'email':req.email.lower(),'name':user['name'],'role':user['role'],'exp':int(datetime.now().timestamp())+3600,'otp_verified':False}
    challenge_id = str(uuid.uuid4()); code = os.getenv('DEMO_OTP','123456')
    OTP_CHALLENGES[challenge_id] = {'email':req.email.lower(),'code':code,'attempts':0,'expires':datetime.now(timezone.utc).timestamp()+300}
    audit(payload,'login_password_verified','auth',req.email.lower())
    return {'success':True,'data':{'access_token':encode(payload),'token_type':'bearer','user':payload,'permissions':sorted(PERMISSIONS[user['role']]),'otp_challenge_id':challenge_id,'mock_sms':f'MOCK SMS: Your BhuView verification code is {code}. Expires in 5 minutes.'}}
@app.post('/api/auth/verify-otp')
def verify_otp(req: OtpRequest):
    challenge=OTP_CHALLENGES.get(req.challenge_id)
    if not challenge or datetime.now(timezone.utc).timestamp()>challenge['expires']: raise HTTPException(401,detail={'success':False,'error':{'code':'OTP_EXPIRED','message':'This OTP has expired. Request a new code.'}})
    if challenge['attempts'] >= 3: raise HTTPException(423,detail={'success':False,'error':{'code':'OTP_LOCKED','message':'Too many failed attempts. Reload the page to retry.'}})
    if req.code != challenge['code']:
        challenge['attempts'] += 1
        raise HTTPException(401,detail={'success':False,'error':{'code':'OTP_INVALID','message':f'Incorrect code. {max(0,3-challenge["attempts"])} attempts remaining.'}})
    user=USERS[challenge['email']]; payload={'email':challenge['email'],'name':user['name'],'role':user['role'],'exp':int(datetime.now().timestamp())+3600,'otp_verified':True}; audit(payload,'login_otp_verified','auth',payload['email']); return {'success':True,'data':{'status':'verified','access_token':encode(payload),'user':payload,'permissions':sorted(PERMISSIONS[user['role']])}}

@app.get('/api/auth/me')
def me(user=Depends(current_user)): return {'success':True,'data':{'user':user,'permissions':sorted(PERMISSIONS[user['role']])}}
@app.post('/api/auth/logout')
def logout(user=Depends(current_user)): audit(user,'logout','auth',user['email']); return {'success':True,'data':{'status':'signed_out'}}

@app.get('/api/parcels')
def list_parcels(q: str = '', user=Depends(current_user)):
    rows = PARCELS if not q else [p for p in PARCELS if q.lower() in ' '.join(map(str,p.values())).lower()]
    if user['role']=='citizen': rows = [p for p in rows if p['owner']=='Meenakshi R.']
    audit(user,'parcel_search','parcels',q or '*'); return {'success':True,'data':rows,'meta':{'total':len(rows),'provider':'mock','label':'DEMONSTRATION DATA'}}
@app.get('/api/parcels/{parcel_id}')
def parcel_detail(parcel_id: str, user=Depends(current_user)):
    p=parcel_or_404(parcel_id)
    if user['role']=='citizen' and p['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    audit(user,'parcel_view','parcel',p['id']); return {'success':True,'data':{**p,'ror':{'record_number':'ROR / 2024 / 01982','owner':p['owner'],'verified':True},'registration':{'number':'REG-2018-00491','status':'Registered'},'encumbrance':{'active_records':1},'zoning':{'category':'Residential','code':'R2'},'tax':{'status':'Current','through':'FY 2025-26'},'utilities':['Water','Electricity'],'environmental':{'restricted':False},'disputes':[]}}

@app.post('/api/service-requests')
def create_request(request: ServiceRequest, user=Depends(require('CREATE_SERVICE_REQUEST'))):
    item={'id':f'SR-2026-{len(REQUESTS)+47:04d}',**request.model_dump(),'status':'SUBMITTED','created_at':now(),'owner':user['email']}; REQUESTS.insert(0,item); audit(user,'create_service_request','workflow',item['id'],new=item); NOTIFICATIONS.insert(0,{'id':str(uuid.uuid4()),'recipient_roles':['revenue_officer'],'title':'New citizen application','message':item['id'],'state':'UNREAD','created_at':now()}); return {'success':True,'data':item}
@app.get('/api/service-requests')
def requests(user=Depends(current_user)):
    rows=REQUESTS if user['role']!='citizen' else [r for r in REQUESTS if r['owner']==user['email']]; return {'success':True,'data':rows}
@app.post('/api/service-requests/{request_id}/transition')
def transition(request_id: str, transition: WorkflowTransition, user=Depends(require('APPROVE_APPLICATION'))):
    item=next((r for r in REQUESTS if r['id']==request_id),None)
    if not item: raise HTTPException(404,detail={'success':False,'error':{'code':'REQUEST_NOT_FOUND','message':'Workflow request not found'}})
    old=item['status']; item['status']=transition.status; item['remarks']=transition.remarks; audit(user,'workflow_transition','workflow',request_id,previous=old,new=transition.status); NOTIFICATIONS.insert(0,{'id':str(uuid.uuid4()),'recipient_roles':['citizen'],'title':'Application status updated','message':f'{request_id}: {transition.status}','state':'UNREAD','created_at':now()}); return {'success':True,'data':item}

@app.get('/api/ai/anomalies')
def anomalies(user=Depends(require('VIEW_AI_ALERTS'))):
    rows=[]
    for p in PARCELS:
        reasons=[]
        if p.get('area_mismatch'): reasons.append('Recorded area and mapped geometry require verification')
        if p.get('open_encumbrance'): reasons.append('Open encumbrance record requires review')
        if p.get('active_dispute'): reasons.append('Active dispute record requires review')
        if p.get('flood_zone'): reasons.append('Flood-zone layer intersection requires verification')
        if p.get('zoning_conflict'): reasons.append('Zoning and land-use records require verification')
        if p.get('boundary_overlap'): reasons.append('Potential boundary overlap requires verification')
        if p.get('same_owner_conflict'): reasons.append('Ownership relationships require verification')
        if reasons: rows.append({'id':f'AN-{p["id"]}','parcel_id':p['id'],'type':'POTENTIAL_INCONSISTENCY','severity':p['risk'],'confidence':round(min(.99,.65+len(reasons)*.06),2),'reasons':reasons,'supporting_records':['DEMONSTRATION DATA'],'recommended_action':'Request verification by the responsible officer'})
    audit(user,'view_ai_anomalies','ai','*')
    return {'success':True,'data':rows}
@app.post('/api/ai/anomalies/{anomaly_id}/flag')
def flag_anomaly(anomaly_id: str, user=Depends(require('VIEW_AI_ALERTS'))): audit(user,'flag_ai_alert','ai',anomaly_id); return {'success':True,'data':{'id':anomaly_id,'status':'AI_FLAGGED'}}
@app.post('/api/ai/risk')
def risk(req: RiskRequest, user=Depends(current_user)):
    p=parcel_or_404(req.parcel_id)
    if user['role']=='citizen' and p['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    factors=[]
    for flag,name,points,evidence in [('area_mismatch','Area mismatch',28,'Mapped and registered area require verification'),('open_encumbrance','Active encumbrance',18,'An encumbrance record requires review'),('active_dispute','Active dispute',20,'An active dispute record requires review'),('flood_zone','Flood-zone intersection',16,'Synthetic flood-risk layer intersection'),('zoning_conflict','Zoning mismatch',14,'Land-use and zoning records require review'),('boundary_overlap','Potential boundary overlap',18,'Parcel geometry indicates a possible overlap'),('same_owner_conflict','Ownership relationship',8,'Related ownership records require review')]:
        if p.get(flag): factors.append({'factor':name,'points':points,'evidence':evidence})
    if any(r['parcel_id']==p['id'] and r['status'] not in {'COMPLETED','REJECTED'} for r in REQUESTS): factors.append({'factor':'Pending verification','points':12,'evidence':'An open service request is associated with this parcel'})
    score=min(100,sum(f['points'] for f in factors)); audit(user,'calculate_parcel_risk','ai',p['id'])
    return {'success':True,'data':{'parcel_id':p['id'],'score':score,'status':'REQUIRES_VERIFICATION' if score else 'NO_FLAGGED_SIGNALS','factors':factors,'recommended_action':'Human review and verification' if score else 'No additional review signal was identified'}}
@app.post('/api/ai/search')
def natural_search(req: NlSearch, user=Depends(current_user)):
    q=req.query.lower(); filters=[]
    if 'overlap' in q or 'conflict' in q: filters=['risk:High']
    if 'my propert' in q: filters=['owner:Meenakshi R.']
    if 'coimbatore' in q: filters=['district:Coimbatore']
    results=[p for p in PARCELS if (p['risk']=='High' if 'risk:High' in filters else True) and (p['owner']=='Meenakshi R.' if 'owner:Meenakshi R.' in filters or user['role']=='citizen' else True)]; return {'success':True,'data':{'interpreted_filters':filters,'results':results[:20],'advisory':'Controlled filters only; no generated SQL is executed'}}

@app.post('/api/documents/upload')
async def upload_document(parcel_id: str=Form(...), document_type: str=Form(...), file: UploadFile=File(...), user=Depends(require('UPLOAD_DOCUMENT'))):
    parcel=parcel_or_404(parcel_id)
    if user['role']=='citizen' and parcel['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    content=await file.read();
    if len(content)>10*1024*1024: raise HTTPException(413,detail={'success':False,'error':{'code':'FILE_TOO_LARGE','message':'Maximum file size is 10 MB'}})
    if file.content_type not in {'application/pdf','image/png','image/jpeg','text/plain'}: raise HTTPException(415,detail={'success':False,'error':{'code':'UNSUPPORTED_FILE','message':'Upload PDF, PNG, JPEG or TXT files only'}})
    doc={'id':str(uuid.uuid4()),'parcel_id':parcel_id,'document_type':document_type,'filename':file.filename,'size':len(content),'status':'OCR_PROCESSED','extraction':{'owner_name':'Meenakshi R.','survey_number':'S.No. 142/3A','parcel_id':parcel_id,'area':'2,400 sq.ft','document_number':'DOC-DEMO-2026-001','registration_date':'2026-09-29','address':'Synthetic address, Chengalpattu'}}; audit(user,'upload_document','documents',doc['id']); return {'success':True,'data':doc}

@app.get('/api/gis/validation')
def gis_validation(user=Depends(current_user)): return {'success':True,'data':{'score':94.2,'total_features':len(PARCELS),'checks':[{'name':'Valid geometry','passed':len(PARCELS),'total':len(PARCELS)},{'name':'Missing ULPIN','passed':len(PARCELS),'total':len(PARCELS)},{'name':'Duplicate parcel IDs','passed':len(PARCELS)-2,'total':len(PARCELS)},{'name':'Overlapping boundaries','passed':len(PARCELS)-1,'total':len(PARCELS)},{'name':'Coordinate errors','passed':len(PARCELS),'total':len(PARCELS)}]}}
@app.get('/api/gis/spatial-analysis')
def spatial_analysis(parcel_id: str, user=Depends(require('RUN_SPATIAL_ANALYSIS'))): p=parcel_or_404(parcel_id); return {'success':True,'data':{'parcel_id':p['id'],'area_sqft':2612,'nearby_features':[{'type':'road','distance_m':42},{'type':'utility','distance_m':18},{'type':'water_body','distance_m':480}],'land_use_conflict':False,'environmental_restriction':False,'boundary_overlap':True}}

@app.get('/api/notifications')
def notifications(user=Depends(current_user)): return {'success':True,'data':[n for n in NOTIFICATIONS if user['role'] in n['recipient_roles'] or user['role']=='system_admin']}
@app.get('/api/audit')
def audit_log(user=Depends(require('VIEW_AUDIT_LOG'))):
    with AUDIT_LOCK: entries=list(AUDIT)
    return {'success':True,'data':entries}
@app.get('/api/audit/verify-chain')
def verify_audit_chain(user=Depends(require('VIEW_AUDIT_LOG'))):
    with AUDIT_LOCK: ordered=list(reversed(AUDIT))
    previous='GENESIS'; intact=True
    for event in ordered:
        material=previous+event['id']+event['actor']+event['role']+event['action']
        if event.get('prevHash') != previous or event.get('hash') != hashlib.sha256(material.encode()).hexdigest(): intact=False; break
        previous=event['hash']
    return {'success':True,'data':{'intact':intact,'entries':len(AUDIT)}}
@app.post('/api/audit/tamper-test')
def tamper_audit(user=Depends(require('VIEW_AUDIT_LOG'))):
    with AUDIT_LOCK:
        if AUDIT: AUDIT[0]['action']='TAMPERED DEMO EVENT'
    return {'success':True,'data':{'status':'tampered_for_demo_verification'}}
@app.post('/api/schema-mappings/propose')
def propose_mapping(req: SchemaProposal, user=Depends(require('MANAGE_API'))):
    patterns={'khesra_number':('survey_no','identity'),'raiyat_name':('owner.name','identity'),'area_decimal':('area_record','decimal_acre_to_sqft'),'jamabandi_no':('ror.record_number','identity')}
    mapping=[{'source_field':key,'target_field':patterns.get(key,('unmapped','review'))[0],'transform':patterns.get(key,('unmapped','review'))[1],'confidence':0.96 if key in patterns else 0.42,'approved':False} for key in req.sample]
    item={'id':str(uuid.uuid4()),'state':req.state,'mapping':mapping,'status':'PENDING_APPROVAL','proposed_by':user['email']}; SCHEMA_MAPPINGS.insert(0,item); return {'success':True,'data':item}
@app.get('/api/schema-mappings')
def list_mappings(user=Depends(require('VIEW_INTEGRATIONS'))): return {'success':True,'data':SCHEMA_MAPPINGS}
@app.post('/api/schema-mappings/{mapping_id}/approve')
def approve_mapping(mapping_id: str, user=Depends(require('MANAGE_API'))):
    item=next((m for m in SCHEMA_MAPPINGS if m['id']==mapping_id),None)
    if not item: raise HTTPException(404,detail={'success':False,'error':{'code':'MAPPING_NOT_FOUND','message':'Mapping not found'}})
    item['status']='APPROVED'; item['approved_by']=user['email']; audit(user,'schema_mapping_approved','schema_mapping',mapping_id,new=item); return {'success':True,'data':item}

@app.get('/api/integrations')
def integrations(user=Depends(require('VIEW_INTEGRATIONS'))): return {'success':True,'data':[{'name':'Land records','provider':'MockGovernmentProvider','status':'Connected','last_sync':'8 min ago','label':'DEMONSTRATION DATA'},{'name':'Registration','provider':'MockGovernmentProvider','status':'Fallback','last_sync':'12 min ago','label':'DEMONSTRATION DATA'},{'name':'GIS service','provider':'PostGIS / GeoJSON','status':'Connected','last_sync':'Live local index','label':'DEMONSTRATION DATA'}]}
@app.get('/api/reports/{report_type}')
def report(report_type: str, user=Depends(current_user)):
    allowed={'parcel','ownership','verification','registration','risk','gis','application','department-analytics'}
    if report_type not in allowed:
        raise HTTPException(400, detail={'success':False,'error':{'code':'INVALID_REPORT','message':'Unknown report type'}})
    audit(user,'generate_report','reports',report_type)
    report_rows=[p for p in PARCELS if user['role']!='citizen' or p['owner']=='Meenakshi R.']
    return {'success':True,'data':{'report_type':report_type,'generated_at':now(),'format':'JSON','rows':report_rows[:10],'source':'DEMONSTRATION DATA'}}

# Signature features: intentionally advisory, synthetic, and audit-backed.
class SimulationRequest(BaseModel):
    parcel_id: str; proposed_land_use: str; building_area: Optional[float] = None; height: Optional[float] = None; setback: Optional[float] = None
class ScenarioRequest(BaseModel):
    parcel_id: str; proposed_land_use: str; simulation: dict[str, Any]
class CompareRequest(BaseModel): ids: list[str]
class AssignRequest(BaseModel): assignee: str

def _dna_for(parcel, user):
    own = parcel['owner'] if user['role'] != 'citizen' or parcel['owner'] == 'Meenakshi R.' else 'RESTRICTED RECORD'
    return {'ulpin':parcel['ulpin'],'center':{'id':parcel['id'],'label':'Parcel 360','value':parcel['ulpin']},'nodes':[{'id':'gis','type':'GIS Geometry','label':'Verified geometry','source':'Cadastral GIS','verification':'GEOMETRY AVAILABLE'},{'id':'ror','type':'RoR','label':'ROR / 2024 / 01982','source':'Revenue record','verification':'DEMONSTRATION RECORD'},{'id':'registration','type':'Registration','label':'REG-2018-00491','source':'Registration index','verification':'REGISTERED'},{'id':'mutation','type':'Mutation history','label':f"{sum(1 for r in REQUESTS if r['parcel_id']==parcel['id'])} linked service requests",'source':'Parcel workflow','verification':'AUDIT-TRACKED'},{'id':'owner','type':'Owner','label':own,'source':'RoR ownership record','verification':'RESTRICTED RECORD' if own=='RESTRICTED RECORD' else 'VERIFIED'},{'id':'audit','type':'Audit Events','label':f"{sum(1 for e in AUDIT if e['record_id']==parcel['id'])} chained events",'source':'SHA-256 audit log','verification':'CHAINED'}],'edges':[{'from':'gis','to':'ror','label':'geometry ↔ RoR'},{'from':'ror','to':'registration','label':'recorded in'},{'from':'registration','to':'mutation','label':'requests'},{'from':'mutation','to':'owner','label':'current ownership'},{'from':'mutation','to':'audit','label':'audit events'}]}
@app.get('/api/land-dna/{ulpin}')
def land_dna(ulpin: str, user=Depends(current_user)):
    p=parcel_or_404(ulpin)
    if user['role']=='citizen' and p['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    audit(user,'view_land_dna','land_dna',p['id']); return {'success':True,'data':_dna_for(p,user)}
@app.get('/api/land-dna/{ulpin}/provenance')
def land_dna_provenance(ulpin: str, user=Depends(current_user)):
    p=parcel_or_404(ulpin)
    if user['role']=='citizen' and p['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    audit(user,'view_provenance','land_dna',p['id']); return {'success':True,'data':{'fields':[{'field':'area','source':'GIS geometry v3','last_updated':'2026-09-29','verification':'MISMATCH','value':'2,612 sq.ft','compare':'RoR: 2,400 sq.ft'},{'field':'owner','source':'RoR / 2024 / 01982','last_updated':'2024-08-12','verification':'VERIFIED','value':p['owner'] if user['role']!='citizen' or p['owner']=='Meenakshi R.' else 'RESTRICTED RECORD'}]}}
@app.get('/api/land-dna/{ulpin}/relationships')
def land_dna_relationships(ulpin: str, user=Depends(current_user)):
    p=parcel_or_404(ulpin)
    if user['role']=='citizen' and p['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    related=[q['id'] for q in PARCELS if q['owner']==p['owner'] and q['id']!=p['id']][:5]; return {'success':True,'data':{'same_owner':related,'adjacent':[f'P-{int(p["id"][2:])+1:04d}'],'boundary_overlap':['P-0007'] if p['id']=='P-0001' else []}}
@app.post('/api/planning/simulate')
def planning_simulate(req: SimulationRequest, user=Depends(current_user)):
    if user['role'] not in {'citizen','planning_officer','department_head'}: raise HTTPException(403,detail={'success':False,'error':{'code':'FORBIDDEN','message':'Planning decision support is not available to this role'}})
    p=parcel_or_404(req.parcel_id)
    if user['role']=='citizen' and p['owner']!='Meenakshi R.': raise HTTPException(404,detail={'success':False,'error':{'code':'PARCEL_NOT_FOUND','message':'Parcel could not be found'}})
    factors=[]
    factors.append({'factor':'Current zoning','status':'CONFLICT' if req.proposed_land_use.lower()!=p['land_use'].lower() else 'COMPATIBLE','points':25 if req.proposed_land_use.lower()!=p['land_use'].lower() else 0,'why':f'Current zoning: {p["land_use"]}. Proposed: {req.proposed_land_use}.'})
    factors.append({'factor':'Flood zone','status':'CONFLICT' if p.get('flood_zone') else 'COMPATIBLE','points':25 if p.get('flood_zone') else 0,'why':'Parcel intersects the synthetic flood-risk layer.' if p.get('flood_zone') else 'No flood-zone intersection detected.'})
    factors.append({'factor':'Encumbrance','status':'CONFLICT' if p.get('open_encumbrance') else 'COMPATIBLE','points':20 if p.get('open_encumbrance') else 0,'why':'An open encumbrance requires verification.' if p.get('open_encumbrance') else 'No open encumbrance in the demo record.'})
    return {'success':True,'data':{'parcel_id':p['id'],'status':'CONFLICTS_FOUND' if any(f['status']=='CONFLICT' for f in factors) else 'COMPATIBLE','label':'Planning decision support','official_decision':False,'factors':factors,'proposed_land_use':req.proposed_land_use}}
@app.post('/api/planning/scenarios')
def planning_scenario(req: ScenarioRequest, user=Depends(current_user)):
    item={'id':f'SIM-{uuid.uuid4().hex[:8].upper()}','parcel_id':req.parcel_id,'proposed_land_use':req.proposed_land_use,'simulation':req.simulation,'label':'SIMULATION — NOT AN OFFICIAL DECISION','owner':user['email']}; PLANNING_SCENARIOS.append(item); audit(user,'save_planning_simulation','planning',item['id'],new=item); return {'success':True,'data':item}
@app.get('/api/planning/scenarios/{scenario_id}')
def get_scenario(scenario_id: str, user=Depends(current_user)):
    item=next((x for x in PLANNING_SCENARIOS if x.get('id')==scenario_id and (user['role']!='citizen' or x.get('owner')==user['email'])),None); return {'success':True,'data':item or {'id':scenario_id,'status':'NOT_FOUND'}}
@app.post('/api/planning/scenarios/compare')
def compare_scenarios(req: CompareRequest, user=Depends(current_user)):
    return {'success':True,'data':{'scenarios':[x for x in PLANNING_SCENARIOS if x.get('id') in req.ids and (user['role']!='citizen' or x.get('owner')==user['email'])],'label':'SIMULATION — NOT AN OFFICIAL DECISION'}}

def _conflicts():
    out=[]
    for p in PARCELS:
        factors=[]
        if p.get('area_mismatch'): factors.append({'name':'Area mismatch','points':20,'evidence':'GIS 2,612 sq.ft vs RoR 2,400 sq.ft'})
        if p.get('open_encumbrance'): factors.append({'name':'Open encumbrance','points':15,'evidence':'1 record requires verification'})
        if p.get('active_dispute'): factors.append({'name':'Active dispute','points':30,'evidence':'Open dispute record'})
        if p.get('flood_zone'): factors.append({'name':'Flood-zone intersection','points':20,'evidence':'Synthetic flood-risk layer'})
        if p.get('zoning_conflict'): factors.append({'name':'Zoning mismatch','points':15,'evidence':'Land use and zoning require review'})
        if factors: out.append({'id':f'CR-{p["id"]}','parcel_id':p['id'],'state':'High Priority Review' if sum(x['points'] for x in factors)>=40 else 'Needs Review','priority':sum(x['points'] for x in factors),'factors':factors})
    return out
@app.get('/api/conflict-radar')
def conflict_radar(window: str='all', user=Depends(require('VIEW_AI_ALERTS'))):
    items=_conflicts(); clusters=[{'id':'CL-07','label':'Cluster #07','parcel_ids':['P-0001','P-0007','P-0019','P-0031'],'summary':'4 parcels — area mismatch, encumbrances, active dispute and flood-zone review'}]; audit(user,'view_conflict_radar','conflict_radar',window); return {'success':True,'data':{'items':items,'clusters':clusters,'window':window}}
@app.get('/api/conflict-radar/clusters/{cluster_id}')
def conflict_cluster(cluster_id: str, user=Depends(require('VIEW_AI_ALERTS'))):
    ids=['P-0001','P-0007','P-0019','P-0031']; return {'success':True,'data':{'id':cluster_id,'parcels':[parcel_or_404(x) for x in ids],'items':[x for x in _conflicts() if x['parcel_id'] in ids]}}
@app.post('/api/conflict-radar/{item_id}/assign')
def assign_conflict(item_id: str, req: AssignRequest, user=Depends(require('ESCALATE_CASE'))): audit(user,'assign_conflict','conflict_radar',item_id,new={'assignee':req.assignee}); return {'success':True,'data':{'id':item_id,'status':'ASSIGNED','assignee':req.assignee}}
@app.post('/api/conflict-radar/{item_id}/resolve')
def resolve_conflict(item_id: str, user=Depends(require('ESCALATE_CASE'))): audit(user,'resolve_conflict','conflict_radar',item_id,new={'status':'RESOLVED'}); return {'success':True,'data':{'id':item_id,'status':'RESOLVED'}}
