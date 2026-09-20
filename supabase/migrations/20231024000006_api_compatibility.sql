-- Forward-only compatibility layer for the Express API contracts.  The early
-- domain migrations remain authoritative; these additive fields preserve their
-- history while giving the prototype a stable API-facing representation.

ALTER TABLE family
  ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS village_ward VARCHAR(100),
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);

ALTER TABLE family_member
  ADD COLUMN IF NOT EXISTS relationship_to_head VARCHAR(50),
  ADD COLUMN IF NOT EXISTS profile_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS caste_category VARCHAR(100);

ALTER TABLE life_event ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE scheme
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS department VARCHAR(255),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS official_portal_url TEXT,
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS district VARCHAR(100);

ALTER TABLE scheme_version
  ADD COLUMN IF NOT EXISTS rule_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE scheme_version ALTER COLUMN version_identifier SET DEFAULT ('v-' || substr(gen_random_uuid()::text, 1, 8));

-- The application tracker intentionally records an external application; it is
-- separate from the original, more detailed `application` domain table.
CREATE TABLE IF NOT EXISTS scheme_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_member(id) ON DELETE SET NULL,
  scheme_id UUID NOT NULL REFERENCES scheme(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
  external_reference_id VARCHAR(100),
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scheme_application_family ON scheme_application(family_id, created_at DESC);

ALTER TABLE redirect_event
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES scheme_application(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES application_user(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_url TEXT,
  ADD COLUMN IF NOT EXISTS redirected_at TIMESTAMPTZ;

-- Additive fields allow benefit history to serve the concise citizen history
-- endpoint without removing the original immutable benefit-state history.
ALTER TABLE benefit_history
  ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES family(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES family_member(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scheme_id UUID REFERENCES scheme(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES scheme_application(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS benefit_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS disbursed_at DATE,
  ADD COLUMN IF NOT EXISTS source_reference VARCHAR(255);
ALTER TABLE benefit_history ALTER COLUMN benefit_id DROP NOT NULL;
ALTER TABLE benefit_history ALTER COLUMN new_status SET DEFAULT 'RECORDED';

ALTER TABLE eligibility_evaluation
  ADD COLUMN IF NOT EXISTS scheme_id UUID REFERENCES scheme(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE eligibility_evaluation ALTER COLUMN profile_version SET DEFAULT 1;
ALTER TABLE eligibility_evaluation ALTER COLUMN result_state SET DEFAULT 'INSUFFICIENT_INFORMATION';
CREATE UNIQUE INDEX IF NOT EXISTS eligibility_evaluation_api_unique
  ON eligibility_evaluation (family_id, member_id, scheme_id) NULLS NOT DISTINCT;

ALTER TABLE notification
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES application_user(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT;
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification(user_id, read_at, created_at DESC);

ALTER TABLE data_quality_issue
  ADD COLUMN IF NOT EXISTS issue_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS resolution_action VARCHAR(100),
  ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES application_user(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
