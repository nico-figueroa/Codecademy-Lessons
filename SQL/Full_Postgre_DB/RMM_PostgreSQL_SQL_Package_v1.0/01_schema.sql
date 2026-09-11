-- RMM PostgreSQL schema v1.0
-- Target: PostgreSQL 15+
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS rmm;
SET search_path = rmm, public;

CREATE TYPE lifecycle_status AS ENUM ('draft','in_review','approved','effective','superseded','retired');
CREATE TYPE record_kind AS ENUM ('summary','detail');
CREATE TYPE risk_stage AS ENUM ('initial','residual');
CREATE TYPE probability_mode AS ENUM ('quantitative','qualitative','hybrid');
CREATE TYPE control_type AS ENUM ('D','P','I');
CREATE TYPE evidence_type AS ENUM ('implementation','effectiveness','source','rationale');
CREATE TYPE approval_decision AS ENUM ('pending','approved','rejected','withdrawn');
CREATE TYPE software_safety_class AS ENUM ('A','B','C','NA');
CREATE TYPE yes_no_na AS ENUM ('yes','no','na');
CREATE TYPE domain_scope AS ENUM ('specific','single_domain','all_domains');

CREATE TABLE organization (
 organization_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_user (
 user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES organization,
 external_subject text UNIQUE, display_name text NOT NULL, email text, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE product_family (
 product_family_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organization,
 family_code text NOT NULL, name text NOT NULL, intended_use text, active boolean NOT NULL DEFAULT true,
 UNIQUE(organization_id,family_code)
);
CREATE TABLE product (
 product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_family_id uuid NOT NULL REFERENCES product_family,
 product_code text NOT NULL, name text NOT NULL, intended_use text, active boolean NOT NULL DEFAULT true,
 UNIQUE(product_family_id,product_code)
);
CREATE TABLE risk_profile (
 risk_profile_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_family_id uuid NOT NULL REFERENCES product_family,
 profile_code text NOT NULL, name text NOT NULL, description text, active boolean NOT NULL DEFAULT true,
 UNIQUE(product_family_id,profile_code)
);
CREATE TABLE product_risk_profile (
 product_id uuid NOT NULL REFERENCES product, risk_profile_id uuid NOT NULL REFERENCES risk_profile,
 valid_from date NOT NULL DEFAULT current_date, valid_to date,
 PRIMARY KEY(product_id,risk_profile_id,valid_from), CHECK(valid_to IS NULL OR valid_to >= valid_from)
);
CREATE TABLE controlled_document (
 controlled_document_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES organization,
 document_id text NOT NULL, revision text, title text NOT NULL, repository text, locator text,
 document_type text, status text, UNIQUE(organization_id,document_id,revision)
);
CREATE TABLE rmm_document (
 rmm_document_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_family_id uuid NOT NULL REFERENCES product_family,
 document_number text NOT NULL, title text NOT NULL, scope_text text NOT NULL, information_classification text,
 template_id text, template_version text, current_revision_id uuid, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(product_family_id,document_number)
);
CREATE TABLE risk_criteria_set (
 risk_criteria_set_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_family_id uuid REFERENCES product_family,
 code text NOT NULL, name text NOT NULL, version text NOT NULL, probability_mode probability_mode NOT NULL,
 source_document_id uuid REFERENCES controlled_document, effective_from date, effective_to date,
 active boolean NOT NULL DEFAULT true, UNIQUE(product_family_id,code,version),
 CHECK(effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
);
CREATE TABLE severity_level (
 risk_criteria_set_id uuid NOT NULL REFERENCES risk_criteria_set ON DELETE CASCADE,
 severity_code text NOT NULL CHECK(severity_code ~ '^S[0-9]+$'), ordinal smallint NOT NULL CHECK(ordinal >= 0),
 label text NOT NULL, definition text, serious_injury_default boolean NOT NULL DEFAULT false,
 PRIMARY KEY(risk_criteria_set_id,severity_code), UNIQUE(risk_criteria_set_id,ordinal)
);
CREATE TABLE probability_level (
 probability_level_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), risk_criteria_set_id uuid NOT NULL REFERENCES risk_criteria_set ON DELETE CASCADE,
 axis text NOT NULL CHECK(axis IN ('P1','P2','PoH')), code text NOT NULL, ordinal smallint,
 label text NOT NULL, lower_bound numeric CHECK(lower_bound IS NULL OR lower_bound >= 0),
 upper_bound numeric CHECK(upper_bound IS NULL OR upper_bound <= 1),
 UNIQUE(risk_criteria_set_id,axis,code), CHECK(lower_bound IS NULL OR upper_bound IS NULL OR lower_bound <= upper_bound)
);
CREATE TABLE risk_zone (
 risk_zone_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), risk_criteria_set_id uuid NOT NULL REFERENCES risk_criteria_set ON DELETE CASCADE,
 code text NOT NULL, label text NOT NULL, color_hex text, ordinal smallint NOT NULL,
 generally_acceptable boolean NOT NULL, requires_control boolean NOT NULL DEFAULT true,
 UNIQUE(risk_criteria_set_id,code)
);
CREATE TABLE risk_matrix_rule (
 risk_matrix_rule_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), risk_criteria_set_id uuid NOT NULL REFERENCES risk_criteria_set ON DELETE CASCADE,
 severity_code text NOT NULL, probability_level_id uuid NOT NULL REFERENCES probability_level,
 risk_zone_id uuid NOT NULL REFERENCES risk_zone, UNIQUE(risk_criteria_set_id,severity_code,probability_level_id),
 FOREIGN KEY(risk_criteria_set_id,severity_code) REFERENCES severity_level(risk_criteria_set_id,severity_code)
);
CREATE TABLE rmm_revision (
 rmm_revision_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_document_id uuid NOT NULL REFERENCES rmm_document ON DELETE CASCADE,
 revision text NOT NULL, revision_number integer NOT NULL CHECK(revision_number > 0), status lifecycle_status NOT NULL DEFAULT 'draft',
 risk_criteria_set_id uuid NOT NULL REFERENCES risk_criteria_set, change_request_id text, change_description text,
 created_by uuid REFERENCES app_user, created_at timestamptz NOT NULL DEFAULT now(), approved_at timestamptz,
 effective_at timestamptz, supersedes_revision_id uuid REFERENCES rmm_revision, immutable_at timestamptz,
 UNIQUE(rmm_document_id,revision), UNIQUE(rmm_document_id,revision_number)
);
ALTER TABLE rmm_document ADD CONSTRAINT fk_current_revision FOREIGN KEY(current_revision_id) REFERENCES rmm_revision;
CREATE TABLE revision_product_scope (
 rmm_revision_id uuid NOT NULL REFERENCES rmm_revision ON DELETE CASCADE, product_id uuid NOT NULL REFERENCES product,
 risk_profile_id uuid REFERENCES risk_profile, PRIMARY KEY(rmm_revision_id,product_id)
);
CREATE TABLE clinical_domain (
 clinical_domain_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES organization,
 code text NOT NULL, name text NOT NULL, definition text, active boolean NOT NULL DEFAULT true,
 CHECK(lower(name) <> 'unknown'), UNIQUE(organization_id,code)
);
CREATE TABLE hazard_category (
 hazard_category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL,
 definition text, active boolean NOT NULL DEFAULT true
);
CREATE TABLE hazard (
 hazard_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), hazard_category_id uuid NOT NULL REFERENCES hazard_category,
 code text NOT NULL UNIQUE, name text NOT NULL, definition text, active boolean NOT NULL DEFAULT true
);
CREATE TABLE hazardous_situation_template (
 hazardous_situation_template_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE,
 name_template text NOT NULL, definition text, active boolean NOT NULL DEFAULT true
);
CREATE TABLE harm_code (
 harm_code_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL,
 definition text, parent_harm_code_id uuid REFERENCES harm_code, annex text CHECK(annex IN ('E','F','LOCAL')),
 selectable_as_harm boolean NOT NULL DEFAULT true, active boolean NOT NULL DEFAULT true
);
CREATE TABLE rmm_record (
 rmm_record_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_revision_id uuid NOT NULL REFERENCES rmm_revision ON DELETE CASCADE,
 business_id text NOT NULL, record_kind record_kind NOT NULL, parent_record_id uuid REFERENCES rmm_record,
 hazard_id uuid NOT NULL REFERENCES hazard, hazardous_situation_template_id uuid NOT NULL REFERENCES hazardous_situation_template,
 hazardous_situation_text text NOT NULL, sequence_of_events text NOT NULL,
 clinical_domain_scope domain_scope NOT NULL DEFAULT 'specific', initial_generally_acceptable boolean,
 premitigation_serious_injury boolean, software_item_identifier text,
 software_safety_class software_safety_class NOT NULL DEFAULT 'NA', control_activities_complete boolean,
 residual_generally_acceptable boolean, rationale text, sort_key numeric(12,4),
 created_by uuid REFERENCES app_user, created_at timestamptz NOT NULL DEFAULT now(),
 updated_by uuid REFERENCES app_user, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(rmm_revision_id,business_id),
 CHECK(business_id ~ '^[A-Za-z0-9_-]+([.]?[0-9]+)*$'),
 CHECK((software_safety_class='NA' AND (software_item_identifier IS NULL OR upper(software_item_identifier)='N/A')) OR
       (software_safety_class<>'NA' AND software_item_identifier IS NOT NULL AND upper(software_item_identifier)<>'N/A'))
);
ALTER TABLE rmm_record ADD CONSTRAINT ck_parent_kind CHECK ((record_kind='summary' AND parent_record_id IS NULL) OR record_kind='detail');
CREATE TABLE record_clinical_domain (
 rmm_record_id uuid NOT NULL REFERENCES rmm_record ON DELETE CASCADE,
 clinical_domain_id uuid NOT NULL REFERENCES clinical_domain, PRIMARY KEY(rmm_record_id,clinical_domain_id)
);
CREATE TABLE record_harm (
 record_harm_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_record_id uuid NOT NULL REFERENCES rmm_record ON DELETE CASCADE,
 harm_code_id uuid NOT NULL REFERENCES harm_code, severity_code text NOT NULL,
 notes text, UNIQUE(rmm_record_id,harm_code_id,severity_code)
);
CREATE TABLE source_reference (
 source_reference_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_record_id uuid NOT NULL REFERENCES rmm_record ON DELETE CASCADE,
 controlled_document_id uuid REFERENCES controlled_document, source_type text NOT NULL,
 external_reference text, locator_detail text, no_source_reason text,
 CHECK(controlled_document_id IS NOT NULL OR external_reference IS NOT NULL OR no_source_reason IS NOT NULL)
);
CREATE TABLE risk_assessment (
 risk_assessment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_record_id uuid NOT NULL REFERENCES rmm_record ON DELETE CASCADE,
 stage risk_stage NOT NULL, p1_numeric numeric CHECK(p1_numeric BETWEEN 0 AND 1), p1_level_id uuid REFERENCES probability_level,
 assessment_rationale text, UNIQUE(rmm_record_id,stage),
 CHECK(p1_numeric IS NOT NULL OR p1_level_id IS NOT NULL)
);
CREATE TABLE risk_assessment_severity (
 risk_assessment_severity_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), risk_assessment_id uuid NOT NULL REFERENCES risk_assessment ON DELETE CASCADE,
 severity_code text NOT NULL, p2_numeric numeric CHECK(p2_numeric BETWEEN 0 AND 1), p2_level_id uuid REFERENCES probability_level,
 poh_numeric numeric CHECK(poh_numeric BETWEEN 0 AND 1),
 poh_level_id uuid REFERENCES probability_level, risk_zone_id uuid NOT NULL REFERENCES risk_zone,
 UNIQUE(risk_assessment_id,severity_code), CHECK(p2_numeric IS NOT NULL OR p2_level_id IS NOT NULL)
);
CREATE TABLE risk_control (
 risk_control_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid REFERENCES organization,
 requirement_id text NOT NULL, title text, requirement_text text, source_document_id uuid REFERENCES controlled_document,
 active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,requirement_id)
);
CREATE TABLE record_risk_control (
 record_risk_control_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_record_id uuid NOT NULL REFERENCES rmm_record ON DELETE CASCADE,
 risk_control_id uuid NOT NULL REFERENCES risk_control, control_type control_type NOT NULL,
 applicability text, p1_impact text, p2_impact text, UNIQUE(rmm_record_id,risk_control_id,control_type)
);
CREATE TABLE control_evidence (
 control_evidence_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), record_risk_control_id uuid NOT NULL REFERENCES record_risk_control ON DELETE CASCADE,
 evidence_type evidence_type NOT NULL CHECK(evidence_type IN ('implementation','effectiveness','rationale')),
 controlled_document_id uuid REFERENCES controlled_document, external_reference text, locator_detail text, rationale text,
 UNIQUE(record_risk_control_id,evidence_type,controlled_document_id,external_reference),
 CHECK(controlled_document_id IS NOT NULL OR external_reference IS NOT NULL OR rationale IS NOT NULL)
);
CREATE TABLE review_session (
 review_session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_revision_id uuid NOT NULL REFERENCES rmm_revision ON DELETE CASCADE,
 session_date date NOT NULL, scope text NOT NULL, minutes_document_id uuid REFERENCES controlled_document
);
CREATE TABLE review_participant (
 review_session_id uuid NOT NULL REFERENCES review_session ON DELETE CASCADE, user_id uuid REFERENCES app_user,
 participant_name text NOT NULL, role_function text NOT NULL, referenced_document_id uuid REFERENCES controlled_document,
 PRIMARY KEY(review_session_id,participant_name,role_function)
);
CREATE TABLE approval_role (
 approval_role_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, required_by_default boolean NOT NULL DEFAULT true
);
CREATE TABLE revision_approval_requirement (
 rmm_revision_id uuid NOT NULL REFERENCES rmm_revision ON DELETE CASCADE, approval_role_id uuid NOT NULL REFERENCES approval_role,
 required boolean NOT NULL DEFAULT true, PRIMARY KEY(rmm_revision_id,approval_role_id)
);
CREATE TABLE revision_approval (
 revision_approval_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rmm_revision_id uuid NOT NULL REFERENCES rmm_revision ON DELETE CASCADE,
 approval_role_id uuid NOT NULL REFERENCES approval_role, approver_user_id uuid REFERENCES app_user,
 approver_name text NOT NULL, decision approval_decision NOT NULL DEFAULT 'pending', decision_at timestamptz, comment text,
 UNIQUE(rmm_revision_id,approval_role_id,approver_name)
);
CREATE TABLE audit_event (
 audit_event_id bigserial PRIMARY KEY, occurred_at timestamptz NOT NULL DEFAULT now(), actor_user_id uuid REFERENCES app_user,
 table_name text NOT NULL, record_pk text NOT NULL, operation text NOT NULL CHECK(operation IN ('INSERT','UPDATE','DELETE','STATUS')),
 old_row jsonb, new_row jsonb, correlation_id uuid DEFAULT gen_random_uuid()
);
CREATE INDEX ix_record_revision ON rmm_record(rmm_revision_id,sort_key);
CREATE INDEX ix_record_hazard_situation ON rmm_record(hazard_id,hazardous_situation_template_id);
CREATE INDEX ix_record_harm_record ON record_harm(rmm_record_id);
CREATE INDEX ix_source_doc ON source_reference(controlled_document_id);
CREATE INDEX ix_evidence_doc ON control_evidence(controlled_document_id);
CREATE INDEX ix_audit_record ON audit_event(table_name,record_pk,occurred_at);
COMMIT;
