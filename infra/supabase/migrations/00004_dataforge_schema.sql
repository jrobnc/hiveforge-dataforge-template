-- DataForge Schema Migration
-- Adds tables for database connections, queries, jobs, and templates

-- Database connections table
CREATE TABLE database_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bigquery', 'snowflake', 'databricks', 'redshift', 'postgresql')),
    connection_config JSONB NOT NULL, -- encrypted credentials and connection details
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

-- SQL queries and templates table
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sql_content TEXT NOT NULL,
    database_type VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(100),
    template_variables JSONB DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}', -- Array of query IDs this depends on
    schedule_config JSONB, -- Cron-like scheduling configuration
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

-- Query execution jobs table
CREATE TABLE job_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES database_connections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Job details
    external_job_id VARCHAR(255), -- ID from external database (BigQuery job ID, etc.)
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

    -- Execution metadata
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_time_ms INTEGER,

    -- Results
    rows_affected INTEGER,
    bytes_processed BIGINT,
    cost_estimate_usd DECIMAL(10, 4),
    result_preview JSONB, -- First few rows for preview

    -- Error handling
    error_message TEXT,
    error_code VARCHAR(100),
    retry_count INTEGER DEFAULT 0,

    -- Audit
    triggered_by VARCHAR(50) DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'schedule', 'dependency', 'webhook')),
    triggered_by_user UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query templates marketplace
CREATE TABLE template_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    author_organization_id UUID REFERENCES organizations(id),

    -- Marketplace metadata
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,

    -- Pricing (if paid template)
    price_usd DECIMAL(10, 2) DEFAULT 0.0,

    -- Categorization
    category VARCHAR(100),
    use_case TEXT,
    supported_databases TEXT[] DEFAULT '{}',

    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query execution logs for debugging
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_execution_id UUID REFERENCES job_executions(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Saved query results for caching
CREATE TABLE query_results_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES database_connections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Cache metadata
    query_hash VARCHAR(64) NOT NULL, -- SHA-256 of normalized query
    parameters_hash VARCHAR(64), -- Hash of query parameters

    -- Cached data
    result_data JSONB NOT NULL,
    row_count INTEGER NOT NULL,
    cache_size_bytes INTEGER,

    -- Cache management
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(query_hash, parameters_hash, connection_id)
);

-- Indexes for performance
CREATE INDEX idx_database_connections_org_id ON database_connections(organization_id);
CREATE INDEX idx_database_connections_type ON database_connections(type);
CREATE INDEX idx_database_connections_active ON database_connections(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_queries_org_id ON queries(organization_id);
CREATE INDEX idx_queries_template ON queries(is_template) WHERE is_template = TRUE;
CREATE INDEX idx_queries_category ON template_marketplace(category);
CREATE INDEX idx_queries_database_type ON queries(database_type);
CREATE INDEX idx_queries_tags ON queries USING GIN(tags);

CREATE INDEX idx_job_executions_org_id ON job_executions(organization_id);
CREATE INDEX idx_job_executions_query_id ON job_executions(query_id);
CREATE INDEX idx_job_executions_connection_id ON job_executions(connection_id);
CREATE INDEX idx_job_executions_status ON job_executions(status);
CREATE INDEX idx_job_executions_created_at ON job_executions(created_at DESC);

CREATE INDEX idx_execution_logs_job_id ON execution_logs(job_execution_id);
CREATE INDEX idx_execution_logs_level ON execution_logs(log_level);
CREATE INDEX idx_execution_logs_timestamp ON execution_logs(timestamp DESC);

CREATE INDEX idx_query_cache_org_id ON query_results_cache(organization_id);
CREATE INDEX idx_query_cache_hash ON query_results_cache(query_hash);
CREATE INDEX idx_query_cache_expires ON query_results_cache(expires_at);

-- RLS Policies for multi-tenancy

-- Database connections policies
ALTER TABLE database_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "database_connections_org_isolation" ON database_connections
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

-- Queries policies
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "queries_org_isolation" ON queries
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

-- Job executions policies
ALTER TABLE job_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_executions_org_isolation" ON job_executions
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

-- Template marketplace policies (public read, restricted write)
ALTER TABLE template_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_marketplace_public_read" ON template_marketplace
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "template_marketplace_author_full" ON template_marketplace
    FOR ALL USING (author_organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

-- Execution logs policies
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "execution_logs_through_job" ON execution_logs
    FOR ALL USING (
        job_execution_id IN (
            SELECT id FROM job_executions
            WHERE organization_id IN (
                SELECT organization_id FROM user_organizations
                WHERE user_id = auth.uid()
            )
        )
    );

-- Query results cache policies
ALTER TABLE query_results_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "query_cache_org_isolation" ON query_results_cache
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_database_connections_updated_at BEFORE UPDATE ON database_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_marketplace_updated_at BEFORE UPDATE ON template_marketplace
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM query_results_cache
    WHERE expires_at IS NOT NULL AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default query templates
INSERT INTO queries (
    organization_id,
    name,
    description,
    sql_content,
    database_type,
    is_template,
    template_category,
    template_variables
) VALUES
-- BigQuery templates
(
    '00000000-0000-0000-0000-000000000000', -- System org ID
    'Daily Active Users',
    'Calculate daily active users from event data',
    'SELECT DATE(event_timestamp) as date, COUNT(DISTINCT user_id) as active_users FROM `{{project}}.{{dataset}}.events` WHERE DATE(event_timestamp) = DATE_SUB(CURRENT_DATE(), INTERVAL {{days_ago}} DAY) GROUP BY DATE(event_timestamp)',
    'bigquery',
    TRUE,
    'Analytics',
    '{"project": "your-project", "dataset": "analytics", "days_ago": 1}'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Revenue by Channel',
    'Calculate revenue by acquisition channel',
    'SELECT acquisition_channel, SUM(revenue) as total_revenue FROM `{{project}}.{{dataset}}.transactions` WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL {{days}} DAY) GROUP BY acquisition_channel ORDER BY total_revenue DESC',
    'bigquery',
    TRUE,
    'Business Intelligence',
    '{"project": "your-project", "dataset": "analytics", "days": 30}'
);

-- Insert into template marketplace
INSERT INTO template_marketplace (
    query_id,
    author_organization_id,
    is_public,
    is_featured,
    category,
    use_case,
    supported_databases
)
SELECT
    id,
    organization_id,
    TRUE,
    TRUE,
    template_category,
    description,
    ARRAY[database_type]
FROM queries
WHERE is_template = TRUE;