CREATE TABLE scheme_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_scheme_category
BEFORE UPDATE ON scheme_category
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE scheme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    detailed_description TEXT,
    department_id UUID REFERENCES department(id) ON DELETE SET NULL,
    category_id UUID REFERENCES scheme_category(id) ON DELETE SET NULL,
    target_beneficiary VARCHAR(255),
    benefit_type VARCHAR(100),
    benefit_value NUMERIC(12, 2),
    frequency VARCHAR(50),
    application_method VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_scheme
BEFORE UPDATE ON scheme
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE scheme_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES scheme(id) ON DELETE CASCADE,
    version_identifier VARCHAR(50) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    rule_set_version VARCHAR(50),
    changed_fields_summary TEXT,
    source_metadata JSONB,
    verification_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (scheme_id, version_identifier)
);

CREATE TABLE eligibility_rule_set (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_version_id UUID NOT NULL REFERENCES scheme_version(id) ON DELETE CASCADE,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_eligibility_rule_set
BEFORE UPDATE ON eligibility_rule_set
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE eligibility_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID NOT NULL REFERENCES eligibility_rule_set(id) ON DELETE CASCADE,
    dimension VARCHAR(100) NOT NULL, -- e.g., 'age', 'income', 'gender'
    operator VARCHAR(20) NOT NULL, -- e.g., '=', '<', 'IN'
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_eligibility_rule
BEFORE UPDATE ON eligibility_rule
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE required_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_version_id UUID NOT NULL REFERENCES scheme_version(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE official_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES scheme(id) ON DELETE CASCADE,
    link_type VARCHAR(50) NOT NULL, -- e.g., 'PORTAL', 'GUIDELINE'
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE scheme_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rule_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE required_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_link ENABLE ROW LEVEL SECURITY;
