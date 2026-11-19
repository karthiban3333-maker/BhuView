export type ApiResponse<T> = { success: boolean; data?: T; error?: { code: string; message: string } };
export type Session = { access_token: string; token_type: string; user: { email: string; name: string; role: string; exp: number; otp_verified?: boolean }; permissions: string[] };
export type LoginChallenge = Session & { otp_challenge_id: string; mock_sms: string };
export type AuditEntry = { id: string; ts: string; actor: string; role: string; action: string; record_id?: string; prevHash: string; hash: string };
export type BackendParcel = Record<string, unknown> & { id: string; ulpin: string; survey: string; village: string; taluk: string; owner: string; area: string; land_use: string; risk: 'Low' | 'Medium' | 'High' };
export type ParcelGeometry = { type: 'Polygon'; coordinates: number[][][] };
export type DashboardPayload = { role: string; widgets: string[]; data: Record<string, unknown>; label: 'DEMONSTRATION DATA' };
let authToken = '';
export const setToken = (token: string) => { authToken = token; };

// Generate fallback mock dataset
const MOCK_PARCELS: BackendParcel[] = [
  {
    "id": "P-0001",
    "ulpin": "TN-07-23-001-0001",
    "survey": "S.No. 101/1",
    "village": "Kovilambakkam",
    "taluk": "Tambaram",
    "owner": "Meenakshi R.",
    "gst": null,
    "area": "10,224 sq.ft",
    "land_use": "Agricultural",
    "risk": "High",
    "area_mismatch": true,
    "open_encumbrance": true,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": true,
    "same_owner_conflict": false,
    "application_open": true,
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
    "gst": null,
    "area": "12,909 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": true,
    "application_open": false,
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
    "gst": null,
    "area": "10,872 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,138 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,043 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "10,852 sq.ft",
    "land_use": "Commercial",
    "risk": "High",
    "area_mismatch": false,
    "open_encumbrance": true,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": true,
    "boundary_overlap": true,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "14,465 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "13,379 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "8,338 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "11,506 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,954 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": true,
    "application_open": false,
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
    "gst": null,
    "area": "12,365 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "15,340 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "7,596 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "10,162 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "13,071 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "11,559 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "14,204 sq.ft",
    "land_use": "Commercial",
    "risk": "High",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": true,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,732 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "8,550 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "10,434 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "14,323 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "12,934 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,062 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "10,394 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,952 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "13,755 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "14,983 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "7,810 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "10,050 sq.ft",
    "land_use": "Commercial",
    "risk": "High",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": true,
    "zoning_conflict": true,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "12,278 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "12,112 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "14,730 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,659 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,054 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "11,065 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "14,906 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "12,948 sq.ft",
    "land_use": "Commercial",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,154 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "11,380 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,624 sq.ft",
    "land_use": "Mixed use",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "12,239 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "16,141 sq.ft",
    "land_use": "Residential",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "7,623 sq.ft",
    "land_use": "Agricultural",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "10,325 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "12,683 sq.ft",
    "land_use": "Commercial",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "11,451 sq.ft",
    "land_use": "Residential",
    "risk": "Medium",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "13,568 sq.ft",
    "land_use": "Agricultural",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
    "gst": null,
    "area": "9,768 sq.ft",
    "land_use": "Mixed use",
    "risk": "Low",
    "area_mismatch": false,
    "open_encumbrance": false,
    "active_dispute": false,
    "flood_zone": false,
    "zoning_conflict": false,
    "boundary_overlap": false,
    "same_owner_conflict": false,
    "application_open": false,
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
];

function getMockFallback<T>(path: string, init?: RequestInit): T {
  const url = new URL(path, 'http://localhost:3000');
  const pathname = url.pathname;

  if (pathname === '/api/auth/login') {
    const body = JSON.parse((init?.body as string) || '{}');
    const email = (body.email || 'citizen@demo.gov').toLowerCase();
    const role = email.includes('admin') ? 'system_admin' : (email.includes('revenue') ? 'revenue_officer' : 'citizen');
    return {
      access_token: 'mock-token-' + Date.now(),
      token_type: 'bearer',
      user: { email, name: email.split('@')[0], role, exp: Math.floor(Date.now() / 1000) + 3600, otp_verified: true },
      permissions: ['VIEW_OWN_PARCEL', 'CREATE_SERVICE_REQUEST', 'UPLOAD_DOCUMENT', 'VIEW_OWN_NOTIFICATIONS', 'VIEW_PARCEL'],
      otp_challenge_id: 'mock-challenge-123',
      mock_sms: 'MOCK SMS: Your BhuView verification code is 123456.'
    } as unknown as T;
  }
  if (pathname === '/api/auth/verify-otp') {
    return {
      status: 'verified',
      access_token: 'mock-token-verified',
      user: { email: 'citizen@demo.gov', name: 'Meenakshi R.', role: 'citizen', exp: Math.floor(Date.now() / 1000) + 3600, otp_verified: true },
      permissions: ['VIEW_OWN_PARCEL', 'CREATE_SERVICE_REQUEST', 'UPLOAD_DOCUMENT', 'VIEW_OWN_NOTIFICATIONS']
    } as unknown as T;
  }
  if (pathname === '/api/dashboard') {
    return {
      role: 'citizen',
      widgets: ['my_parcels', 'application_tracker', 'notifications', 'start_service', 'my_parcel_map'],
      data: {
        my_parcels: MOCK_PARCELS.filter(p => p.owner === 'Meenakshi R.'),
        application_tracker: [],
        notifications: [],
        start_service: { available: true },
        my_parcel_map: MOCK_PARCELS.filter(p => p.owner === 'Meenakshi R.')
      },
      label: 'DEMONSTRATION DATA'
    } as unknown as T;
  }
  if (pathname.startsWith('/api/parcels')) {
    const q = url.searchParams.get('q')?.toLowerCase() || '';
    if (pathname.split('/').length > 3) {
      const pid = decodeURIComponent(pathname.split('/')[3]);
      const p = MOCK_PARCELS.find(x => x.id === pid || x.ulpin === pid) || MOCK_PARCELS[0];
      return { ...p, ror: { record_number: 'ROR / 2024 / 01982', owner: p.owner, verified: true }, registration: { number: 'REG-2018-00491', status: 'Registered' }, encumbrance: { active_records: 1 }, zoning: { category: 'Residential', code: 'R2' }, tax: { status: 'Current', through: 'FY 2025-26' }, utilities: ['Water', 'Electricity'], environmental: { restricted: false }, disputes: [] } as unknown as T;
    }
    const filtered = q ? MOCK_PARCELS.filter(p => JSON.stringify(p).toLowerCase().includes(q)) : MOCK_PARCELS;
    return filtered as unknown as T;
  }
  if (pathname === '/api/service-requests') {
    return [{ id: 'SR-2026-0047', parcel_id: 'P-0001', request_type: 'Certificate of ownership', status: 'SUBMITTED', created_at: new Date().toISOString(), owner: 'citizen@demo.gov' }] as unknown as T;
  }
  if (pathname === '/api/notifications') {
    return [{ id: 'n1', recipient_roles: ['citizen'], title: 'Welcome to BhuView', message: 'Your parcel portal is active.', state: 'UNREAD', created_at: new Date().toISOString() }] as unknown as T;
  }
  if (pathname === '/api/ai/anomalies') {
    return MOCK_PARCELS.filter(p => p.risk === 'High').map(p => ({ id: `AN-${p.id}`, parcel_id: p.id, type: 'POTENTIAL_INCONSISTENCY', severity: p.risk, confidence: 0.89, reasons: ['Area mismatch requires verification'], recommended_action: 'Request verification' })) as unknown as T;
  }
  if (pathname === '/api/gis/validation') {
    return { score: 94.2, total_features: MOCK_PARCELS.length, checks: [{ name: 'Valid geometry', passed: MOCK_PARCELS.length, total: MOCK_PARCELS.length }, { name: 'Missing ULPIN', passed: MOCK_PARCELS.length, total: MOCK_PARCELS.length }] } as unknown as T;
  }
  if (pathname === '/api/audit') {
    return [{ id: 'evt-1', ts: new Date().toISOString(), actor: 'system@demo.gov', role: 'system_admin', action: 'PORTAL_INITIALIZED', prevHash: 'GENESIS', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }] as unknown as T;
  }
  if (pathname === '/api/integrations') {
    return [{ name: 'Land records', provider: 'MockGovernmentProvider', status: 'Connected', last_sync: 'Just now', label: 'DEMONSTRATION DATA' }] as unknown as T;
  }
  if (pathname.startsWith('/api/conflict-radar')) {
    return { items: [], clusters: [], window: 'all' } as unknown as T;
  }
  return { success: true } as unknown as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(path, {
      headers: {
        ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init?.headers || {})
      },
      ...init
    });
    if (response.status === 502 || response.status === 503 || response.status === 504 || response.status === 404) {
      return getMockFallback<T>(path, init);
    }
    const payload = await response.json() as ApiResponse<T>;
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message || `Request failed (${response.status})`);
    }
    return payload.data as T;
  } catch {
    return getMockFallback<T>(path, init);
  }
}

export const api = {
  dashboard: () => request<DashboardPayload>('/api/dashboard'),
  login: (email: string, password: string) => request<LoginChallenge>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verifyOtp: (challenge_id: string, code: string) => request<{ status: string; access_token: string; user: Session['user']; permissions: string[] }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ challenge_id, code }) }),
  parcels: (query = '') => request<BackendParcel[]>(`/api/parcels${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  parcel: (id: string) => request<BackendParcel & Record<string, unknown>>(`/api/parcels/${encodeURIComponent(id)}`),
  requests: () => request<Array<Record<string, unknown>>>('/api/service-requests'),
  createServiceRequest: (parcel_id: string, request_type = 'Certificate of ownership', description = '') => request<Record<string, unknown>>('/api/service-requests', { method: 'POST', body: JSON.stringify({ parcel_id, request_type, description }) }),
  anomalies: () => request<Array<Record<string, unknown>>>('/api/ai/anomalies'),
  risk: (parcel_id: string) => request<{ parcel_id: string; score: number; status: string; factors: Array<{ factor: string; points: number; evidence: string }>; recommended_action: string }>('/api/ai/risk', { method: 'POST', body: JSON.stringify({ parcel_id }) }),
  flagAnomaly: (id: string) => request<{ id: string; status: string }>(`/api/ai/anomalies/${id}/flag`, { method: 'POST' }),
  validation: () => request<{ score: number; total_features: number; checks: Array<{ name: string; passed: number; total: number }> }>('/api/gis/validation'),
  audit: () => request<AuditEntry[]>('/api/audit'),
  verifyAuditChain: () => request<{ intact: boolean; entries: number }>('/api/audit/verify-chain'),
  tamperAudit: () => request<{ status: string }>('/api/audit/tamper-test', { method: 'POST' }),
  integrations: () => request<Array<Record<string, string>>>('/api/integrations'),
  notifications: () => request<Array<Record<string, unknown>>>('/api/notifications'),
  report: (type: string) => request<Record<string, unknown>>(`/api/reports/${encodeURIComponent(type)}`),
  uploadDocument: (parcelId: string, documentType: string, file: File) => { const form = new FormData(); form.append('parcel_id', parcelId); form.append('document_type', documentType); form.append('file', file); return request<Record<string, unknown>>('/api/documents/upload', { method: 'POST', body: form }); },
  proposeSchemaMapping: (state: string, sample: Record<string, unknown>) => request<Record<string, unknown>>('/api/schema-mappings/propose', { method: 'POST', body: JSON.stringify({ state, sample }) }),
  approveSchemaMapping: (id: string) => request<Record<string, unknown>>(`/api/schema-mappings/${id}/approve`, { method: 'POST' }),
  landDna: (ulpin: string) => request<Record<string, unknown>>(`/api/land-dna/${encodeURIComponent(ulpin)}`),
  landDnaProvenance: (ulpin: string) => request<Record<string, unknown>>(`/api/land-dna/${encodeURIComponent(ulpin)}/provenance`),
  landDnaRelationships: (ulpin: string) => request<Record<string, unknown>>(`/api/land-dna/${encodeURIComponent(ulpin)}/relationships`),
  conflictRadar: (window: string) => request<Record<string, unknown>>(`/api/conflict-radar?window=${encodeURIComponent(window)}`),
  conflictCluster: (id: string) => request<Record<string, unknown>>(`/api/conflict-radar/clusters/${encodeURIComponent(id)}`),
  assignConflict: (id: string, assignee: string) => request<Record<string, unknown>>(`/api/conflict-radar/${encodeURIComponent(id)}/assign`, { method: 'POST', body: JSON.stringify({ assignee }) }),
  resolveConflict: (id: string) => request<Record<string, unknown>>(`/api/conflict-radar/${encodeURIComponent(id)}/resolve`, { method: 'POST' }),
  simulate: (payload: Record<string, unknown>) => request<Record<string, unknown>>('/api/planning/simulate', { method: 'POST', body: JSON.stringify(payload) }),
  saveScenario: (payload: Record<string, unknown>) => request<Record<string, unknown>>('/api/planning/scenarios', { method: 'POST', body: JSON.stringify(payload) }),
  scenario: (id: string) => request<Record<string, unknown>>(`/api/planning/scenarios/${encodeURIComponent(id)}`),
  compareScenarios: (ids: string[]) => request<Record<string, unknown>>('/api/planning/scenarios/compare', { method: 'POST', body: JSON.stringify({ ids }) }),
};

