BEGIN; SET search_path=rmm,public;
CREATE OR REPLACE VIEW v_rmm_traceability AS
SELECT d.document_number,rv.revision,r.business_id,r.record_kind,
 hc.name hazard_category,h.name hazard,hs.name_template hazardous_situation,r.sequence_of_events,
 string_agg(DISTINCT hm.code||' - '||hm.name, '; ') harms,
 string_agg(DISTINCT rc.requirement_id, '; ') controls,
 string_agg(DISTINCT cd.document_id||COALESCE(' Rev '||cd.revision,''), '; ') evidence_documents
FROM rmm_document d JOIN rmm_revision rv USING(rmm_document_id)
JOIN rmm_record r USING(rmm_revision_id) JOIN hazard h USING(hazard_id)
JOIN hazard_category hc USING(hazard_category_id)
JOIN hazardous_situation_template hs USING(hazardous_situation_template_id)
LEFT JOIN record_harm rh USING(rmm_record_id) LEFT JOIN harm_code hm USING(harm_code_id)
LEFT JOIN record_risk_control rrc USING(rmm_record_id) LEFT JOIN risk_control rc USING(risk_control_id)
LEFT JOIN control_evidence ce USING(record_risk_control_id) LEFT JOIN controlled_document cd USING(controlled_document_id)
GROUP BY d.document_number,rv.revision,r.business_id,r.record_kind,hc.name,h.name,hs.name_template,r.sequence_of_events;

CREATE OR REPLACE VIEW v_revision_validation AS
SELECT rv.rmm_revision_id,rv.revision,v.* FROM rmm_revision rv CROSS JOIN LATERAL validate_rmm_revision(rv.rmm_revision_id) v;
COMMIT;
