import re

with open("parcels_py.txt", "r") as f:
    py_parcels = f.read()

with open("backend/app/main.py", "r") as f:
    main_py_content = f.read()

# Replace lines between 'PARCELS = []' and 'AUDIT: list'
pattern = r"PARCELS = \[\][\s\S]*?(?=AUDIT: list)"
new_main_py = re.sub(pattern, py_parcels + "\n\n", main_py_content)

with open("backend/app/main.py", "w") as f:
    f.write(new_main_py)

print("Updated backend/app/main.py")

with open("parcels_js.txt", "r") as f:
    js_parcels = f.read()

with open("frontend/src/api.ts", "r") as f:
    api_ts_content = f.read()

pattern_js = r"const MOCK_PARCELS: BackendParcel\[\] = [\s\S]*?;\n\nfunction getMockFallback"
new_api_ts = re.sub(pattern_js, js_parcels + "\n\nfunction getMockFallback", api_ts_content)

with open("frontend/src/api.ts", "w") as f:
    f.write(new_api_ts)

print("Updated frontend/src/api.ts")
