


CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions / tokens (simple server-side session store)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects (or organizations)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (owner_id, name)
);

-- Metrics (definition per project)
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(150) NOT NULL,                -- machine key e.g. "co2_emissions"
    name VARCHAR(255) NOT NULL,               -- friendly name
    unit VARCHAR(64),                         -- e.g. "kgCO2"
    metadata JSONB,                           -- additional configuration
    created_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, key)
);

-- Time-series values for metrics
CREATE TABLE metric_values (
    id BIGSERIAL PRIMARY KEY,
    metric_id INT NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
    value NUMERIC(18,6) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,         -- when the measurement was for
    source VARCHAR(255),                      -- optional source or device
    metadata JSONB,                           -- e.g. raw payload
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_metric_values_metric_time ON metric_values(metric_id, recorded_at DESC);
CREATE INDEX idx_metric_values_recorded_at ON metric_values(recorded_at);

-- Dashboards (store layout / widgets as JSON)
CREATE TABLE dashboards (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,                    -- layout, widgets, queries
    created_by INT REFERENCES users(id),
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboard widgets mapping (optional)
CREATE TABLE dashboard_widgets (
    id SERIAL PRIMARY KEY,
    dashboard_id INT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(100) NOT NULL,
    props JSONB,
    position JSONB,                            -- x/y/width/height or similar
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attachments / uploads
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE SET NULL,
    uploaded_by INT REFERENCES users(id),
    file_name VARCHAR(512) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,          -- storage path or URL
    mime_type VARCHAR(128),
    size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit/log table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(128),
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Example seed rows
INSERT INTO roles (name, description) VALUES
  ('admin','Administrator with full access'),
  ('editor','Can create and edit content'),
  ('viewer','Read-only access');

-- Indexes to speed up common lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_metrics_project ON metrics(project_id);
CREATE INDEX idx_dashboards_project ON dashboards(project_id);