SET search_path=rmm,public;
-- Validation gate
SELECT * FROM validate_rmm_revision(:revision_id);
-- Complete RMM traceability
SELECT * FROM v_rmm_traceability WHERE document_number=:document_number AND revision=:revision ORDER BY business_id;
-- Controls missing evidence
SELECT r.business_id,rc.requirement_id,
 bool_or(e.evidence_type='implementation') has_implementation,
 bool_or(e.evidence_type='effectiveness') has_effectiveness
FROM rmm_record r JOIN record_risk_control x USING(rmm_record_id) JOIN risk_control rc USING(risk_control_id)
LEFT JOIN control_evidence e USING(record_risk_control_id)
WHERE r.rmm_revision_id=:revision_id GROUP BY r.business_id,rc.requirement_id
HAVING NOT bool_or(e.evidence_type='implementation') OR NOT bool_or(e.evidence_type='effectiveness');
-- Audit history
SELECT * FROM audit_event WHERE table_name='rmm_record' AND record_pk=:record_id ORDER BY occurred_at;
