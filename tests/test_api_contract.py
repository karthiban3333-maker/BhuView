"""Run with the FastAPI service active: python tests/test_api_contract.py"""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import urllib.error
import urllib.request

BASE = 'http://127.0.0.1:8000'
DASHBOARDS = {
    'citizen@demo.gov': {'my_parcels','application_tracker','notifications','start_service','my_parcel_map'},
    'revenue@demo.gov': {'assigned_cases','mutation_requests','area_mismatch_alerts','request_sla','cases_map'},
    'registration@demo.gov': {'pending_registrations','encumbrance_queue','registration_ror_mismatches','document_review'},
    'planning@demo.gov': {'building_applications','zoning_conflicts','flood_zone_parcels','planning_shortcut','zoning_map'},
    'gis@demo.gov': {'data_quality','geometry_errors','import_jobs','layer_health'},
    'head@demo.gov': {'requests_by_status','priority_clusters','escalations','department_performance'},
    'dataadmin@demo.gov': {'integration_health','mapping_approvals','import_jobs','quality_trend'},
    'admin@demo.gov': {'users_roles','system_health','audit_chain','security_events'},
}

def call(path, method='GET', body=None, token=None, headers=None):
    request_headers = {'Content-Type':'application/json'}
    if token:
        request_headers['Authorization'] = 'Bearer ' + token
    if headers:
        request_headers.update(headers)
    payload = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(BASE + path, method=method, headers=request_headers, data=payload)
    try:
        with urllib.request.urlopen(request) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        try:
            return error.code, json.load(error)
        finally:
            error.close()

def verified(email):
    status, result = call('/api/auth/login', 'POST', {'email':email,'password':'BhuView@2026'})
    assert status == 200 and 'otp_challenge_id' in result['data'], (email, status, result)
    status, result = call('/api/auth/verify-otp', 'POST', {'challenge_id':result['data']['otp_challenge_id'],'code':'123456'})
    assert status == 200
    return result['data']['access_token']

def multipart_upload(token):
    boundary = '----BhuViewContractBoundary7MA4YWxkTrZu0gW'
    content = b'%PDF-1.4 demo'
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="parcel_id"\r\n\r\nP-0001\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="document_type"\r\n\r\nRoR extract\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample.pdf"\r\nContent-Type: application/pdf\r\n\r\n'
    ).encode() + content + f'\r\n--{boundary}--\r\n'.encode()
    headers = {'Content-Type':f'multipart/form-data; boundary={boundary}','Authorization':'Bearer '+token}
    request = urllib.request.Request(BASE+'/api/documents/upload',method='POST',headers=headers,data=body)
    try:
        with urllib.request.urlopen(request) as response:
            return response.status,json.load(response)
    except urllib.error.HTTPError as error:
        return error.code,json.load(error)

def main():
    tokens = {email:verified(email) for email in DASHBOARDS}
    # Every authenticated dashboard is role-shaped and contains only that role's widget whitelist.
    for email, expected in DASHBOARDS.items():
        status, result = call('/api/dashboard', token=tokens[email])
        assert status == 200 and result['success'] is True
        assert set(result['data']['widgets']) == expected, (email, result)
        assert set(result['data']['data']) == expected, (email, result['data']['data'].keys())
        assert result['data']['role']
    assert len({tuple(sorted(call('/api/dashboard', token=tokens[email])[1]['data']['widgets'])) for email in DASHBOARDS}) == 8
    # A validly signed but unknown role cannot obtain any dashboard payload.
    from backend.app.main import encode
    unknown = encode({'email':'unknown@demo.gov','role':'unknown_role','otp_verified':True,'exp':9999999999})
    assert call('/api/dashboard', token=unknown)[0] == 403
    assert call('/api/dashboard')[0] == 401

    citizen = tokens['citizen@demo.gov']
    assert call('/api/ai/anomalies', token=citizen)[0] == 403
    status, own_rows = call('/api/parcels', token=citizen)
    assert status == 200 and own_rows['data'] and all(row['owner']=='Meenakshi R.' for row in own_rows['data'])
    assert call('/api/parcels/P-0002', token=citizen)[0] == 404
    assert call('/api/ai/risk', 'POST', {'parcel_id':'P-0002'}, citizen)[0] == 404
    assert call('/api/planning/simulate', 'POST', {'parcel_id':'P-0002','proposed_land_use':'Commercial'}, citizen)[0] == 404
    assert call('/api/parcels/P-0001', token=citizen)[0] == 200

    # Seed records carry closed GeoJSON Polygon rings; the deliberate overlap pair is explicit.
    revenue = tokens['revenue@demo.gov']
    status, parcels = call('/api/parcels', token=revenue)
    assert status == 200 and len(parcels['data']) == 50
    for parcel in parcels['data']:
        geometry = parcel.get('geometry')
        assert geometry and geometry['type'] == 'Polygon'
        ring = geometry['coordinates'][0]
        assert len(ring) >= 4 and ring[0] == ring[-1]
        assert all(len(point) == 2 and all(isinstance(v,(float,int)) for v in point) for point in ring)
        assert isinstance(parcel.get('updated_year'), int)
    assert parcels['data'][0]['boundary_overlap'] and parcels['data'][6]['boundary_overlap']

    status, risk_one = call('/api/ai/risk','POST',{'parcel_id':'P-0001'},revenue)
    status_two, risk_two = call('/api/ai/risk','POST',{'parcel_id':'P-0002'},revenue)
    assert status == status_two == 200 and risk_one['data']['score'] != risk_two['data']['score']
    gis = tokens['gis@demo.gov']
    assert call('/api/ai/anomalies',token=gis)[0] == 200
    assert call('/api/conflict-radar',token=gis)[0] == 200

    # Simulation is advisory and isolated from canonical parcel records and the schema-mapping store.
    planning = tokens['planning@demo.gov']
    _, before = call('/api/parcels/P-0001',token=planning)
    assert call('/api/planning/simulate','POST',{'parcel_id':'P-0001','proposed_land_use':'Commercial','building_area':2400,'height':2,'setback':3},planning)[0] == 200
    assert call('/api/planning/scenarios','POST',{'parcel_id':'P-0001','proposed_land_use':'Commercial','simulation':{'status':'CONFLICTS_FOUND'}},planning)[0] == 200
    _, after = call('/api/parcels/P-0001',token=planning)
    assert before['data']['land_use'] == after['data']['land_use']
    _, mappings = call('/api/schema-mappings',token=tokens['dataadmin@demo.gov'])
    assert not any(item.get('id','').startswith('SIM-') for item in mappings['data'])

    # Resolve actions must append an auditable event; GIS can access its own conflict dashboard signals.
    before_count = len(call('/api/audit',token=tokens['admin@demo.gov'])[1]['data'])
    assert call('/api/conflict-radar/CR-P-0001/resolve','POST',token=revenue)[0] == 200
    audit_status, audit_after = call('/api/audit',token=tokens['admin@demo.gov'])
    assert audit_status == 200 and len(audit_after['data']) > before_count
    assert any(event['action']=='resolve_conflict' and event['record_id']=='CR-P-0001' for event in audit_after['data'])
    assert call('/api/audit/verify-chain',token=tokens['admin@demo.gov'])[1]['data']['intact'] is True

    # Multipart form fields match the frontend upload request contract.
    upload_status, upload_result = multipart_upload(citizen)
    assert upload_status == 200 and upload_result['data']['parcel_id']=='P-0001'
    print('API_CONTRACT_OK')

if __name__ == '__main__':
    main()
