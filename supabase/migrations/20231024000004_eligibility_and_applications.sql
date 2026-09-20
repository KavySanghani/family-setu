CREATE TYPE eligibility_state AS ENUM (
    'POTENTIALLY_ELIGIBLE',
    'POTENTIALLY_NOT_ELIGIBLE',
    'INSUFFICIENT_INFORMATION',
    'REQUIRES_MANUAL_VERIFICATION'
);

CREATE TABLE eligibility_evaluation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_member(id) ON DELETE CASCADE,
    scheme_version_id UUID NOT NULL REFERENCES scheme_version(id) ON DELETE CASCADE,
    rule_set_id UUID REFERENCES eligibility_rule_set(id) ON DELETE SET NULL,
    profile_version INTEGER NOT NULL,
    result_state eligibility_state NOT NULL,
    matched_conditions JSONB,
    failed_conditions JSONB,
    requires_manual_verification BOOLEAN NOT NULL DEFAULT FALSE,
    explanation_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE eligibility_reason (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES eligibility_evaluation(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES eligibility_rule(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'PASSED', 'FAILED'
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE missing_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES eligibility_evaluation(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE application_status AS ENUM (
    'DRAFT',
    'APPLIED',
    'DOCUMENT_VERIFICATION',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'BENEFIT_PROCESSING',
    'DISBURSED',
    'CLOSED'
);

CREATE TABLE application (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_member(id) ON DELETE CASCADE,
    scheme_version_id UUID NOT NULL REFERENCES scheme_version(id) ON DELETE RESTRICT,
    external_application_ref VARCHAR(100),
    status application_status NOT NULL DEFAULT 'DRAFT',
    external_portal VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_application
BEFORE UPDATE ON application
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES application(id) ON DELETE CASCADE,
    previous_status application_status,
    new_status application_status NOT NULL,
    actor UUID REFERENCES application_user(id) ON DELETE SET NULL,
    reason TEXT,
    request_correlation_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE redirect_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_member(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES scheme(id) ON DELETE CASCADE,
    destination_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE benefit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_member(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES scheme(id) ON DELETE RESTRICT,
    benefit_type VARCHAR(100) NOT NULL,
    benefit_year INTEGER NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2),
    status VARCHAR(50) NOT NULL,
    disbursement_date DATE,
    source VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_benefit
BEFORE UPDATE ON benefit
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE benefit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benefit_id UUID NOT NULL REFERENCES benefit(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    actor UUID REFERENCES application_user(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE eligibility_evaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_reason ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_history ENABLE ROW LEVEL SECURITY;
