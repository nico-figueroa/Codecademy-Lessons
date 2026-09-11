-- Run after schema/functions/views/seed. Intended for pgTAP-free smoke testing.
BEGIN; SET search_path=rmm,public;
DO $$ BEGIN
 IF compute_poh(0.1,0.2) <> 0.02 THEN RAISE EXCEPTION 'compute_poh failed'; END IF;
 IF EXISTS(SELECT 1 FROM clinical_domain WHERE lower(name)='unknown') THEN RAISE EXCEPTION 'Unknown clinical domain exists'; END IF;
END $$;
ROLLBACK;
