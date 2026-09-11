BEGIN;
SET search_path=rmm,public;
CREATE OR REPLACE FUNCTION compute_poh(p_p1 numeric,p_p2 numeric) RETURNS numeric
LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT p_p1*p_p2 $$;

CREATE OR REPLACE FUNCTION enforce_parent_record() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p rmm_record;
BEGIN
 IF NEW.record_kind='detail' THEN
   IF NEW.parent_record_id IS NULL THEN RAISE EXCEPTION 'Detail record requires parent_record_id'; END IF;
   SELECT * INTO p FROM rmm_record WHERE rmm_record_id=NEW.parent_record_id;
   IF NOT FOUND OR p.record_kind<>'summary' OR p.rmm_revision_id<>NEW.rmm_revision_id THEN
     RAISE EXCEPTION 'Parent must be a summary record in the same revision';
   END IF;
 ELSE
   IF NEW.parent_record_id IS NOT NULL THEN RAISE EXCEPTION 'Summary record cannot have a parent'; END IF;
 END IF;
 RETURN NEW;
END$$;
CREATE TRIGGER trg_parent_record BEFORE INSERT OR UPDATE ON rmm_record FOR EACH ROW EXECUTE FUNCTION enforce_parent_record();

CREATE OR REPLACE FUNCTION guard_immutable_revision() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE rid uuid; imm timestamptz;
BEGIN
 IF TG_OP='DELETE' THEN rid := OLD.rmm_revision_id; ELSE rid := NEW.rmm_revision_id; END IF;
 SELECT immutable_at INTO imm FROM rmm_revision WHERE rmm_revision_id=rid;
 IF imm IS NOT NULL THEN RAISE EXCEPTION 'Approved/effective revision is immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END$$;
DO $$DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['rmm_record','revision_product_scope','review_session','revision_approval_requirement']
 LOOP EXECUTE format('CREATE TRIGGER trg_immutable_%I BEFORE INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION guard_immutable_revision()',t,t); END LOOP;
END$$;

CREATE OR REPLACE FUNCTION validate_quantitative_poh() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p1 numeric; mode probability_mode;
BEGIN
 SELECT a.p1_numeric,c.probability_mode INTO p1,mode FROM risk_assessment a JOIN rmm_record r USING(rmm_record_id)
 JOIN rmm_revision v USING(rmm_revision_id) JOIN risk_criteria_set c USING(risk_criteria_set_id)
 WHERE a.risk_assessment_id=NEW.risk_assessment_id;
 IF mode IN ('quantitative','hybrid') AND p1 IS NOT NULL AND NEW.p2_numeric IS NOT NULL THEN
   IF NEW.poh_numeric IS NULL THEN NEW.poh_numeric := p1*NEW.p2_numeric;
   ELSIF abs(NEW.poh_numeric-(p1*NEW.p2_numeric)) > 0.0000000001 THEN RAISE EXCEPTION 'PoH must equal P1 * P2'; END IF;
 END IF;
 RETURN NEW;
END$$;
CREATE TRIGGER trg_validate_poh BEFORE INSERT OR UPDATE ON risk_assessment_severity FOR EACH ROW EXECUTE FUNCTION validate_quantitative_poh();

CREATE OR REPLACE FUNCTION validate_rmm_revision(p_revision uuid) RETURNS TABLE(rule_code text,severity text,entity_id text,message text)
LANGUAGE sql STABLE AS $$
 SELECT 'RMM-001','ERROR',r.business_id,'Specific clinical-domain scope requires at least one domain'
 FROM rmm_record r WHERE r.rmm_revision_id=p_revision AND r.clinical_domain_scope='specific'
 AND NOT EXISTS(SELECT 1 FROM record_clinical_domain d WHERE d.rmm_record_id=r.rmm_record_id)
 UNION ALL
 SELECT 'RMM-002','ERROR',r.business_id,'Both initial and residual risk assessments are required'
 FROM rmm_record r WHERE r.rmm_revision_id=p_revision AND
 (SELECT count(*) FROM risk_assessment a WHERE a.rmm_record_id=r.rmm_record_id)<2
 UNION ALL
 SELECT 'RMM-003','ERROR',r.business_id,'At least one harm is required'
 FROM rmm_record r WHERE r.rmm_revision_id=p_revision AND NOT EXISTS(SELECT 1 FROM record_harm h WHERE h.rmm_record_id=r.rmm_record_id)
 UNION ALL
 SELECT 'RMM-004','ERROR',r.business_id,'At least one source reference or documented no-source reason is required'
 FROM rmm_record r WHERE r.rmm_revision_id=p_revision AND NOT EXISTS(SELECT 1 FROM source_reference s WHERE s.rmm_record_id=r.rmm_record_id)
 UNION ALL
 SELECT 'RMM-005','ERROR',r.business_id,'Controls marked complete require implementation and effectiveness evidence'
 FROM rmm_record r WHERE r.rmm_revision_id=p_revision AND r.control_activities_complete
 AND EXISTS (SELECT 1 FROM record_risk_control rc WHERE rc.rmm_record_id=r.rmm_record_id AND
   (NOT EXISTS(SELECT 1 FROM control_evidence e WHERE e.record_risk_control_id=rc.record_risk_control_id AND e.evidence_type='implementation')
    OR NOT EXISTS(SELECT 1 FROM control_evidence e WHERE e.record_risk_control_id=rc.record_risk_control_id AND e.evidence_type='effectiveness')))
 UNION ALL
 SELECT 'RMM-006','ERROR',r.business_id,'Duplicate hazard/situation details require a summary parent'
 FROM rmm_record r WHERE r.rmm_revision_id=p_revision AND r.record_kind='detail' AND r.parent_record_id IS NULL;
$$;

CREATE OR REPLACE FUNCTION publish_revision(p_revision uuid,p_actor uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE errs int; reqs int; appr int;
BEGIN
 SELECT count(*) INTO errs FROM validate_rmm_revision(p_revision) WHERE severity='ERROR';
 IF errs>0 THEN RAISE EXCEPTION 'Revision has % validation errors',errs; END IF;
 SELECT count(*) INTO reqs FROM revision_approval_requirement WHERE rmm_revision_id=p_revision AND required;
 SELECT count(DISTINCT approval_role_id) INTO appr FROM revision_approval WHERE rmm_revision_id=p_revision AND decision='approved';
 IF appr<reqs THEN RAISE EXCEPTION 'Required approvals incomplete'; END IF;
 UPDATE rmm_revision SET status='effective',approved_at=COALESCE(approved_at,now()),effective_at=now(),immutable_at=now() WHERE rmm_revision_id=p_revision;
 UPDATE rmm_document d SET current_revision_id=p_revision FROM rmm_revision r WHERE r.rmm_revision_id=p_revision AND d.rmm_document_id=r.rmm_document_id;
 INSERT INTO audit_event(actor_user_id,table_name,record_pk,operation,new_row) VALUES(p_actor,'rmm_revision',p_revision::text,'STATUS',jsonb_build_object('status','effective'));
END$$;
COMMIT;
