import json
from generate_parcels import generate_all_parcels

parcels = generate_all_parcels()

# Write Python representation to backend/app/main.py replacement file snippet
py_code = "PARCELS = " + json.dumps(parcels, indent=2).replace("true", "True").replace("false", "False").replace("null", "None")

with open("parcels_py.txt", "w") as f:
    f.write(py_code)

# Write JS representation to frontend/src/api.ts replacement snippet
js_code = "const MOCK_PARCELS: BackendParcel[] = " + json.dumps(parcels, indent=2) + ";"

with open("parcels_js.txt", "w") as f:
    f.write(js_code)

print("Generated parcel code snippets successfully.")
