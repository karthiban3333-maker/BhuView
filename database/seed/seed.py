"""Seed 100 synthetic parcel rows for a Postgres/PostGIS deployment."""
import json
from pathlib import Path

villages = ['Kovilambakkam', 'Medavakkam', 'Pallikaranai', 'Perumbakkam', 'Tambaram']
rows = []
for i in range(1, 101):
    village = villages[(i - 1) % len(villages)]
    rows.append({'parcel_id': f'P-{i:04d}', 'ulpin': f'TN-07-23-001-{i:04d}', 'survey_number': f'S.No. {100+i}/1', 'village': village, 'district': 'Chengalpattu', 'area': 1000 + i * 17, 'land_type': ['Residential', 'Agricultural', 'Mixed use'][i % 3]})
Path('database/seed/parcels.json').write_text(json.dumps(rows, indent=2))
print(f'Prepared {len(rows)} synthetic parcel rows. Load through your PostGIS migration runner.')
