-- FamilySetu synthetic demo seed. Apply only to a dedicated development/staging
-- Supabase project after migrations; it is additive and never deletes data.
-- All identifiers and people below are fictional.
INSERT INTO department (id, code, name) VALUES
 ('00000000-0000-4000-8000-000000000101', 'SOCIAL_WELFARE', 'Synthetic Social Welfare')
ON CONFLICT (id) DO NOTHING;

INSERT INTO scheme_category (id, name, description) VALUES
 ('00000000-0000-4000-8000-000000000201', 'Education', 'Synthetic education programmes'),
 ('00000000-0000-4000-8000-000000000202', 'Social Security', 'Synthetic social support programmes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO family (id, family_id, status, verification_status, household_size, annual_income, address_line1, village_ward, district, state, pincode) VALUES
 ('00000000-0000-4000-8000-000000000301', 'DEMO-FAM-ALPHA', 'ACTIVE', 'VERIFIED', 3, 85000, '12 Demo Lane', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009'),
 ('00000000-0000-4000-8000-000000000302', 'DEMO-FAM-BRAVO', 'ACTIVE', 'UNVERIFIED', 2, NULL, '8 Example Road', 'Adajan', 'Surat', 'Gujarat', '395009'),
 ('00000000-0000-4000-8000-000000000303', 'DEMO-FAM-CHARLIE', 'ACTIVE', 'PENDING', 2, 120000, '4 Sample Chowk', 'Maninagar', 'Ahmedabad', 'Gujarat', '380008')
ON CONFLICT (family_id) DO NOTHING;

INSERT INTO family_member (id, family_id, member_id, full_name, date_of_birth, gender, relationship_to_head, student_status, annual_income, disability_status) VALUES
 ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000301', 'DEMO-MEM-ALPHA-1', 'Aarav Demo', '1982-04-10', 'MALE', 'SELF', 'NOT_STUDENT', 85000, 'false'),
 ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000301', 'DEMO-MEM-ALPHA-2', 'Mira Demo', '2010-08-17', 'FEMALE', 'CHILD', 'STUDENT', 0, 'false'),
 ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000302', 'DEMO-MEM-BRAVO-1', 'Dev Demo', '1950-01-03', 'MALE', 'SELF', 'NOT_STUDENT', NULL, 'false')
ON CONFLICT (member_id) DO NOTHING;

INSERT INTO member_relationship (member_id, related_member_id, relationship_type) VALUES
 ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000402', 'PARENT')
ON CONFLICT (member_id, related_member_id) DO NOTHING;

INSERT INTO life_event (family_id, member_id, event_type, event_date, description) VALUES
 ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000402', 'EDUCATION_CHANGE', '2025-06-01', 'Synthetic school enrolment update'),
 ('00000000-0000-4000-8000-000000000303', NULL, 'ADDRESS_CHANGE', '2025-03-20', 'Synthetic address review')
ON CONFLICT DO NOTHING;

INSERT INTO scheme (id, scheme_id, name, short_description, department_id, category_id, is_active, description, category, department, status, official_portal_url) VALUES
 ('00000000-0000-4000-8000-000000000501', 'DEMO-EDU-01', 'Demo Education Assistance', 'Synthetic education support', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', true, 'Demonstration-only scheme record.', 'Education', 'Synthetic Social Welfare', 'ACTIVE', 'https://example.gov.in/demo-education'),
 ('00000000-0000-4000-8000-000000000502', 'DEMO-SENIOR-01', 'Demo Senior Support', 'Synthetic senior support', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202', true, 'Demonstration-only scheme record.', 'Social Security', 'Synthetic Social Welfare', 'ACTIVE', 'https://example.gov.in/demo-senior')
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO scheme_version (id, scheme_id, version_identifier, effective_from, rule_definition, benefits_definition, required_documents) VALUES
 ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000501', 'demo-1.0', '2025-01-01', '{"groups":[{"name":"Student support","rules":[{"name":"Student status","field":"student_status","operator":"eq","value":"STUDENT"}]}]}', '{"summary":"Synthetic annual education assistance"}', '["Synthetic income declaration","Institution confirmation"]'),
 ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000502', 'demo-1.0', '2025-01-01', '{"groups":[{"name":"Senior support","rules":[{"name":"Age requirement","field":"age","operator":"gte","value":60}]}]}', '{"summary":"Synthetic senior support"}', '["Synthetic age declaration"]')
ON CONFLICT (scheme_id, version_identifier) DO NOTHING;

INSERT INTO scheme_application (id, family_id, member_id, scheme_id, status, external_reference_id, idempotency_key, submitted_at) VALUES
 ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000501', 'APPROVED', 'DEMO-APP-1001', 'demo-application-1001', '2025-07-02')
ON CONFLICT (idempotency_key) DO NOTHING;

INSERT INTO eligibility_evaluation (family_id, member_id, scheme_version_id, scheme_id, profile_version, result_state, status, reasons, missing_information, evaluated_at) VALUES
 ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000501', 1, 'POTENTIALLY_ELIGIBLE', 'ELIGIBLE', '[{"rule":"Student status","status":"PASSED","detail":"student_status matches STUDENT"}]', '[]', '2025-07-01'),
 ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000502', 1, 'INSUFFICIENT_INFORMATION', 'NEEDS_INFORMATION', '[]', '["annual income"]', '2025-07-01')
ON CONFLICT (family_id, member_id, scheme_id) DO NOTHING;
