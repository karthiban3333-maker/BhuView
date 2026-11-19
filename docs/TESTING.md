# Testing guide

Smoke-test the API with the demo password `BhuView@2026` in development only. Log in as `citizen@demo.gov`, obtain a token, verify parcel search is limited to owned demo records, and verify citizen attempts to call officer endpoints receive 403. Log in as `revenue@demo.gov`, verify AI alerts and workflow operations succeed, and verify admin-only endpoints fail. Log in as `admin@demo.gov`, verify audit and administration endpoints succeed.

The end-to-end demo is: citizen login → parcel search → Parcel 360 → service request → revenue AI alert → workflow transition → planning GIS analysis → document upload/OCR-shaped extraction → notification → audit entry. Frontend build and Python compilation are required before delivery.
