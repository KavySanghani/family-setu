-- Setup updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_department
BEFORE UPDATE ON department
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_role
BEFORE UPDATE ON role
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permission (
    role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permission(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE application_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL, -- references auth.users in Supabase
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES department(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_application_user
BEFORE UPDATE ON application_user
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE user_role (
    user_id UUID NOT NULL REFERENCES application_user(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_scope (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES application_user(id) ON DELETE CASCADE,
    scope_type VARCHAR(50) NOT NULL, -- e.g., 'DEPARTMENT', 'DISTRICT', 'SCHEME'
    scope_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, scope_type, scope_value)
);

-- Enable RLS on all tables
ALTER TABLE department ENABLE ROW LEVEL SECURITY;
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scope ENABLE ROW LEVEL SECURITY;
