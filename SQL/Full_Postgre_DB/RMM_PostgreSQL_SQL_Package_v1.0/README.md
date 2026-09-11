# RMM PostgreSQL Delivery Package

## Contents
1. `01_schema.sql` - normalized PostgreSQL 15+ schema.
2. `02_functions.sql` - hierarchy, immutability, validation, PoH and publication functions.
3. `03_views.sql` - traceability and validation views.
4. `04_seed_reference_data.sql` - starter approval roles, hazardous-situation templates, and representative hazards.
5. `05_excel_staging.sql` - lossless staging table for Excel migration.
6. `06_smoke_tests.sql` - transaction-safe basic tests.
7. `deploy.sql` - psql deployment order.
8. `rollback.sql` - destructive development-only teardown.
9. `example_queries.sql` - common traceability and validation queries.

## Deployment
Run with psql from this directory: `psql -v ON_ERROR_STOP=1 -f deploy.sql <database>`.

## Design assumptions
- Supports multiple product families, products, RMMs and revisions.
- Approved/effective revisions are immutable; create a successor revision for changes.
- Controlled documents remain in the authoritative repository; PostgreSQL stores identifiers and metadata.
- Quantitative and qualitative criteria are both supported.
- S0-S4 are data, not physical columns, allowing criteria evolution.
- IEC 62304 is treated as the intended software safety classification reference; the IEC 60234 wording in the guidance tab is retained as a documented source discrepancy.
- Full harm/hazard catalogs should be loaded from the authoritative controlled source, not manually inferred from this starter seed.
