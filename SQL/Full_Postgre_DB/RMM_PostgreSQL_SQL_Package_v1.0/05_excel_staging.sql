-- Staging model for deterministic Excel migration
BEGIN; CREATE SCHEMA IF NOT EXISTS rmm_stage;
CREATE TABLE IF NOT EXISTS rmm_stage.rmm_excel_row(
 load_id uuid NOT NULL DEFAULT gen_random_uuid(), source_file text NOT NULL, source_sheet text NOT NULL,
 source_row integer NOT NULL, business_id text, source_reference_raw text, clinical_domain_raw text,
 hazard_category_raw text, hazard_raw text, hazardous_situation_raw text, sequence_of_events_raw text,
 harm_raw text, initial_p1_raw text, initial_s0_p2_raw text, initial_s0_poh_raw text, initial_s0_zone_raw text,
 initial_s1_p2_raw text, initial_s1_poh_raw text, initial_s1_zone_raw text,
 initial_s2_p2_raw text, initial_s2_poh_raw text, initial_s2_zone_raw text,
 initial_s3_p2_raw text, initial_s3_poh_raw text, initial_s3_zone_raw text,
 initial_s4_p2_raw text, initial_s4_poh_raw text, initial_s4_zone_raw text,
 initial_acceptable_raw text, serious_injury_raw text, software_item_raw text, software_class_raw text,
 control_d_raw text, control_p_raw text, control_i_raw text,
 residual_p1_raw text, residual_s0_p2_raw text, residual_s0_poh_raw text, residual_s0_zone_raw text,
 residual_s1_p2_raw text, residual_s1_poh_raw text, residual_s1_zone_raw text,
 residual_s2_p2_raw text, residual_s2_poh_raw text, residual_s2_zone_raw text,
 residual_s3_p2_raw text, residual_s3_poh_raw text, residual_s3_zone_raw text,
 residual_s4_p2_raw text, residual_s4_poh_raw text, residual_s4_zone_raw text,
 implementation_reference_raw text, effectiveness_reference_raw text,
 controls_complete_raw text, residual_acceptable_raw text,
 loaded_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(load_id,source_row)
);
CREATE TABLE IF NOT EXISTS rmm_stage.load_issue(
 issue_id bigserial PRIMARY KEY, load_id uuid NOT NULL, source_row integer, field_name text,
 rule_code text NOT NULL, severity text NOT NULL, raw_value text, message text NOT NULL, created_at timestamptz DEFAULT now()
);
COMMIT;
