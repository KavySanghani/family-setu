CREATE TYPE family_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

CREATE TABLE family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. GJ-FAM-00010234
    head_member_id UUID, -- References family_member(id), will add FK later
    status family_status NOT NULL DEFAULT 'ACTIVE',
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    last_verified_at TIMESTAMPTZ,
    profile_version INTEGER NOT NULL DEFAULT 1,
    household_size INTEGER NOT NULL DEFAULT 1,
    annual_income NUMERIC(12, 2),
    economic_data JSONB, -- For scheme-relevant configurable attributes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_family
BEFORE UPDATE ON family
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE family_address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    village_town VARCHAR(100) NOT NULL,
    taluka VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_family_address
BEFORE UPDATE ON family_address
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE family_address_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    previous_address_id UUID,
    address_data JSONB NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID REFERENCES application_user(id) ON DELETE SET NULL,
    reason TEXT
);

CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');

CREATE TABLE family_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    member_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. GJ-MEM-00034567
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_enum NOT NULL,
    education_level VARCHAR(100),
    occupation VARCHAR(100),
    annual_income NUMERIC(12, 2),
    marital_status VARCHAR(50),
    student_status VARCHAR(50),
    employment_status VARCHAR(50),
    disability_status VARCHAR(50),
    is_dependent BOOLEAN NOT NULL DEFAULT FALSE,
    scheme_attributes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_family_member
BEFORE UPDATE ON family_member
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Now add FK for family head
ALTER TABLE family ADD CONSTRAINT fk_family_head FOREIGN KEY (head_member_id) REFERENCES family_member(id) ON DELETE SET NULL;

CREATE TABLE member_relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES family_member(id) ON DELETE CASCADE,
    related_member_id UUID NOT NULL REFERENCES family_member(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- e.g., 'SPOUSE', 'CHILD', 'PARENT'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, related_member_id)
);

CREATE TABLE life_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES family(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_member(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'BIRTH', 'MARRIAGE', 'DEATH'
    event_date DATE NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE family_update_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES application_user(id) ON DELETE SET NULL,
    update_payload JSONB NOT NULL,
    status verification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_family_update_request
BEFORE UPDATE ON family_update_request
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS on all tables
ALTER TABLE family ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_address_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_relationship ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_update_request ENABLE ROW LEVEL SECURITY;
