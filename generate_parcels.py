import math
import random
import json

# Define 5 inland village clusters in Chengalpattu / Tambaram area (all > 5km inland from Bay of Bengal)
VILLAGE_CLUSTERS = [
    {
        "name": "Kovilambakkam",
        "taluk": "Tambaram",
        "center_lon": 80.1920,
        "center_lat": 12.9280,
        "angle": 0.25 # radians orientation
    },
    {
        "name": "Medavakkam",
        "taluk": "Tambaram",
        "center_lon": 80.1880,
        "center_lat": 12.9150,
        "angle": -0.15
    },
    {
        "name": "Pallikaranai",
        "taluk": "Tambaram",
        "center_lon": 80.2050,
        "center_lat": 12.9350,
        "angle": 0.40
    },
    {
        "name": "Perumbakkam",
        "taluk": "Tambaram",
        "center_lon": 80.1980,
        "center_lat": 12.8980,
        "angle": 0.10
    },
    {
        "name": "Maraimalai Nagar",
        "taluk": "Tambaram",
        "center_lon": 80.0250,
        "center_lat": 12.7900,
        "angle": -0.30
    }
]

# Land use types
LAND_USES = ['Residential', 'Agricultural', 'Mixed use', 'Commercial']
OWNERS = ['Meenakshi R.', 'Arun Kumar', 'Lakshmi Devi', 'Suresh B.', 'Kavitha S.']

def calculate_geodesic_area_sqft(polygon_coords):
    # Calculates area of a polygon in sq.ft using spherical projection
    # polygon_coords = [[lon, lat], ...]
    if not polygon_coords or len(polygon_coords) < 3:
        return 0
    R = 6378137.0 # Earth radius in meters
    area = 0.0
    n = len(polygon_coords) - 1 # ring closes
    for i in range(n):
        p1 = polygon_coords[i]
        p2 = polygon_coords[i+1]
        lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
        lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
        area += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
    area = abs(area * R * R / 2.0)
    sqft = area * 10.7639
    return round(sqft)

def calculate_centroid(polygon_coords):
    # Calculates centroid [lon, lat]
    n = len(polygon_coords) - 1
    sum_lon = sum(p[0] for p in polygon_coords[:n])
    sum_lat = sum(p[1] for p in polygon_coords[:n])
    return [round(sum_lon / n, 6), round(sum_lat / n, 6)]

def generate_parcel_ring(center_lon, center_lat, width_m, height_m, angle, jitter_seed):
    # Converts width/height in meters around center_lon/center_lat into EPSG:4326 ring with slight polygon irregularities
    rng = random.Random(jitter_seed)
    
    # 1 deg lat ~ 111,000 meters; 1 deg lon ~ 111,000 * cos(lat)
    lat_deg_per_m = 1.0 / 111000.0
    lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(center_lat)))
    
    half_w = width_m / 2.0
    half_h = height_m / 2.0
    
    # Corners relative to center in meters with subtle irregular polygon variations (+- 1.5m)
    corners_m = [
        [-half_w + rng.uniform(-1.5, 1.5), -half_h + rng.uniform(-1.5, 1.5)],
        [ half_w + rng.uniform(-1.5, 1.5), -half_h + rng.uniform(-1.5, 1.5)],
        [ half_w + rng.uniform(-1.5, 1.5),  half_h + rng.uniform(-1.5, 1.5)],
        [-half_w + rng.uniform(-1.5, 1.5),  half_h + rng.uniform(-1.5, 1.5)],
    ]
    
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    
    ring = []
    for xm, ym in corners_m:
        # Rotate
        rx = xm * cos_a - ym * sin_a
        ry = xm * sin_a + ym * cos_a
        
        # Convert to lon/lat
        lon = center_lon + rx * lon_deg_per_m
        lat = center_lat + ry * lat_deg_per_m
        ring.append([round(lon, 6), round(lat, 6)])
        
    ring.append(ring[0]) # close polygon
    return ring

def generate_all_parcels():
    random.seed(20260929)
    parcels = []
    
    for i in range(1, 51):
        cluster_idx = (i - 1) % len(VILLAGE_CLUSTERS)
        cluster = VILLAGE_CLUSTERS[cluster_idx]
        
        # Sub-block layout inside cluster (2 rows x 5 cols per cluster)
        idx_in_cluster = (i - 1) // len(VILLAGE_CLUSTERS)
        row = idx_in_cluster // 2
        col = idx_in_cluster % 2
        
        # Base parcel size in meters (e.g. 20m x 30m = 600 sqm ~ 6,450 sq.ft)
        w_m = 22.0 + (i % 5) * 3.5
        h_m = 32.0 + (i % 3) * 4.0
        
        # Block spacing with road corridors (8m road gap)
        spacing_x = 35.0
        spacing_y = 48.0
        
        offset_x_m = (col - 1.0) * spacing_x + (i % 4) * 2.0
        offset_y_m = (row - 2.0) * spacing_y + ((i * 3) % 5) * 1.5
        
        cos_a = math.cos(cluster['angle'])
        sin_a = math.sin(cluster['angle'])
        
        rot_x = offset_x_m * cos_a - offset_y_m * sin_a
        rot_y = offset_x_m * sin_a + offset_y_m * cos_a
        
        lat_deg_per_m = 1.0 / 111000.0
        lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(cluster['center_lat'])))
        
        p_center_lon = cluster['center_lon'] + rot_x * lon_deg_per_m
        p_center_lat = cluster['center_lat'] + rot_y * lat_deg_per_m
        
        ring = generate_parcel_ring(p_center_lon, p_center_lat, w_m, h_m, cluster['angle'], i * 101)
        
        # Calculated sqft matching actual geometry
        sqft_calc = calculate_geodesic_area_sqft(ring)
        
        risk = 'High' if i in {1, 7, 19, 31} else ('Medium' if i % 3 == 0 else 'Low')
        village_name = 'Kovilambakkam' if i == 1 else cluster['name']
        owner_name = 'Meenakshi R.' if i == 1 else OWNERS[i % len(OWNERS)]
        land_use = LAND_USES[i % len(LAND_USES)]
        
        parcel = {
            'id': f'P-{i:04d}',
            'ulpin': f'TN-07-23-001-{i:04d}',
            'survey': f'S.No. {100+i}/1',
            'village': village_name,
            'taluk': cluster['taluk'],
            'owner': owner_name,
            'gst': '33AABCU9603R1Z5' if i == 4 else None,
            'area': f'{sqft_calc:,} sq.ft',
            'land_use': land_use,
            'risk': risk,
            'area_mismatch': i == 1,
            'open_encumbrance': i in {1, 7},
            'active_dispute': i == 19,
            'flood_zone': i == 31,
            'zoning_conflict': i in {7, 31},
            'boundary_overlap': i in {1, 7},
            'same_owner_conflict': i in {2, 12},
            'application_open': i == 1,
            'priority_score': (30 if risk == 'High' else 15 if risk == 'Medium' else 5) + (i % 7),
            'updated_year': 2018 + (i % 9),
            'geometry': {
                'type': 'Polygon',
                'coordinates': [ring]
            }
        }
        parcels.append(parcel)
        
    return parcels

if __name__ == '__main__':
    data = generate_all_parcels()
    print(f"Generated {len(data)} parcels.")
    print("Sample Parcel 1:", json.dumps(data[0], indent=2))
