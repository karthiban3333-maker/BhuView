import math
import json
import sys

def calculate_geodesic_area_sqft(polygon_coords):
    if not polygon_coords or len(polygon_coords) < 3:
        return 0
    R = 6378137.0
    area = 0.0
    n = len(polygon_coords) - 1
    for i in range(n):
        p1 = polygon_coords[i]
        p2 = polygon_coords[i+1]
        lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
        lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
        area += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
    area = abs(area * R * R / 2.0)
    return round(area * 10.7639)

def validate_dataset(parcels):
    print("==========================================================")
    print("     BHUVIEW LAND PARCEL GEOMETRY & LAND MASK AUDIT       ")
    print("==========================================================")
    
    seen_ids = set()
    errors = 0
    passed = 0
    
    # Land Mask bounding box for inland Chengalpattu / Tambaram region
    # Longitude: 80.00 E to 80.22 E (Sea starts at 80.25 E)
    # Latitude: 12.75 N to 12.95 N
    MIN_LON, MAX_LON = 80.000, 80.220
    MIN_LAT, MAX_LAT = 12.750, 12.950
    
    for p in parcels:
        pid = p.get('id')
        p_errors = []
        
        # 1. Unique ID check
        if pid in seen_ids:
            p_errors.append(f"Duplicate ID: {pid}")
        seen_ids.add(pid)
        
        # 2. Geometry check
        geom = p.get('geometry', {})
        if geom.get('type') != 'Polygon' or not geom.get('coordinates'):
            p_errors.append("Invalid geometry structure")
            ring = []
        else:
            ring = geom['coordinates'][0]
            
        if len(ring) < 4:
            p_errors.append("Polygon has fewer than 4 points")
            
        # 3. Coordinate range & Sea check (EPSG:4326 [lon, lat])
        for lon, lat in ring:
            if not (MIN_LON <= lon <= MAX_LON and MIN_LAT <= lat <= MAX_LAT):
                p_errors.append(f"Out of land mask bounds / Sea placement: [{lon}, {lat}]")
                break
                
        # 4. Area calculation match
        area_str = str(p.get('area', '')).replace(' sq.ft', '').replace(',', '')
        try:
            area_stated = float(area_str)
            area_calc = calculate_geodesic_area_sqft(ring)
            if area_stated > 0:
                diff_pct = abs(area_stated - area_calc) / area_stated * 100.0
                if diff_pct > 2.0:
                    p_errors.append(f"Area mismatch: stated={area_stated}, calc={area_calc} ({diff_pct:.2f}% diff)")
        except ValueError:
            p_errors.append(f"Invalid area string: {p.get('area')}")
            
        if p_errors:
            errors += 1
            print(f"[FAIL] Parcel {pid}: {', '.join(p_errors)}")
        else:
            passed += 1
            print(f"[PASS] Parcel {pid} ({p.get('village')}): Stated Area={p.get('area')} | Lon={ring[0][0]:.4f}, Lat={ring[0][1]:.4f}")

    print("----------------------------------------------------------")
    print(f"SUMMARY REPORT: {passed}/{len(parcels)} Passed | {errors} Failed")
    print("----------------------------------------------------------")
    return errors == 0

if __name__ == '__main__':
    from generate_parcels import generate_all_parcels
    parcels = generate_all_parcels()
    success = validate_dataset(parcels)
    if not success:
        sys.exit(1)
    else:
        print("ALL PARCELS PASSED 100% LAND MASK AND GEOMETRY AUDIT!")
