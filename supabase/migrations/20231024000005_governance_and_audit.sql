CREATE TYPE verification_decision AS ENUM (
    'SUBMITTED',
    'UNDER_VERIFICATION',
    'VERIFIED',
    'REJECTED'
);

CREATE TABLE verification_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'FAMILY', 'MEMBER', 'APPLICATION'
    entity_id UUID NOT NULL,
    request_type VARCHAR(100) NOT NULL,
    submitted_change JSONB,
    old_value JSONB,
    new_value JSONB,
    evidence_metadata JSONB,
    reviewer_id UUID REFERENCES application_user(id) ON DELETE SET NULL,
    decision verification_decision NOT NULL DEFAULT 'SUBMITTED',
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_verification_request
BEFORE UPDATE ON verification_request
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100),
    entity_id UUID,
    bucket_id VARCHAR(100) NOT NULL,
    object_path TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    checksum VARCHAR(255),
    verification_status verification_decision NOT NULL DEFAULT 'SUBMITTED',
    creator_id UUID REFERENCES application_user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_document
BEFORE UPDATE ON document
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE document_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    object_path TEXT NOT NULL,
    checksum VARCHAR(255),
    created_by UUID REFERENCES application_user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, version_number)
);

CREATE TABLE duplicate_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    duplicate_entity_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- e.g., 'OPEN', 'RESOLVED', 'IGNORED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_duplicate_flag
BEFORE UPDATE ON duplicate_flag
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    member_id UUID,
    purpose VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'GRANTED', 'REVOKED'
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    recorded_by UUID,
    metadata JSONB
);

CREATE TYPE issue_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

CREATE TABLE data_quality_issue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    severity issue_severity NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_data_quality_issue
BEFORE UPDATE ON data_quality_issue
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES application_user(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    request_id VARCHAR(100),
    change_summary JSONB,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE outbox_state AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

CREATE TABLE outbox_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    state outbox_state NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_outbox_event
BEFORE UPDATE ON outbox_event
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE processed_event (
    event_id UUID PRIMARY KEY, -- refers to external event ID or internal if consuming
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_details TEXT
);

CREATE TABLE report_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    parameters JSONB,
    result_url TEXT
);

CREATE TABLE export_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job(id) ON DELETE CASCADE,
    export_type VARCHAR(100) NOT NULL,
    destination VARCHAR(255),
    row_count INTEGER
);

CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES application_user(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- e.g., 'EMAIL', 'SMS', 'IN_APP'
    source_event_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivery_metadata JSONB
);

CREATE TABLE notification_preference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES application_user(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notification_type, channel)
);

-- Enable RLS on all tables
ALTER TABLE verification_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_flag ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_issue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE job ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preference ENABLE ROW LEVEL SECURITY;
