/*Cloudflare D1 SQLite*/
CREATE TABLE user_account (
    uuid TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    organization TEXT,
    is_email_verified INTEGER NOT NULL DEFAULT 0,
    registered_at INTEGER NOT NULL,
    password_hash TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE TABLE stripe_customers (
    uuid TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    had_subscription_before INTEGER NOT NULL DEFAULT 0,
    current_product_id TEXT,
    current_period_end_at INTEGER,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (uuid) REFERENCES user_account (uuid) ON DELETE CASCADE
);
CREATE TABLE activity_record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    action_name TEXT NOT NULL,
    ip_address TEXT,
    country TEXT,
    ua_device TEXT,
    ua_os TEXT,
    ua_browser TEXT
);
CREATE TABLE magic_link_login (
    login_token TEXT PRIMARY KEY UNIQUE,
    uuid TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    requested_at INTEGER NOT NULL,
    expire_at INTEGER NOT NULL,
    FOREIGN KEY (uuid) REFERENCES user_account (uuid) ON DELETE CASCADE
);
CREATE TABLE login_session (
    session_id TEXT PRIMARY KEY,
    uuid TEXT NOT NULL,
    email TEXT NOT NULL,
    nickname TEXT NOT NULL,
    organization TEXT,
    stripe_customer_id TEXT,
    current_product_id TEXT,
    current_period_end_at INTEGER,
    had_subscription_before INTEGER,
    created_at INTEGER NOT NULL,
    expire_at INTEGER NOT NULL,
    ip_address TEXT,
    country TEXT,
    ua_device TEXT,
    ua_os TEXT,
    ua_browser TEXT,
    FOREIGN KEY (uuid) REFERENCES user_account (uuid) ON DELETE CASCADE
);
CREATE TABLE register_record (
    uuid TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    referral_code TEXT,
    registered_at INTEGER NOT NULL,
    ip_address TEXT,
    country TEXT,
    ua_device TEXT,
    ua_os TEXT,
    ua_browser TEXT
);
CREATE TABLE password_reset_token (
    uuid TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nickname TEXT,
    token TEXT NOT NULL,
    requested_at INTEGER NOT NULL,
    expire_at INTEGER NOT NULL,
    ip_address TEXT,
    FOREIGN KEY (uuid) REFERENCES user_account (uuid) ON DELETE CASCADE
);
CREATE TABLE contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    contact_message TEXT,
    ip_address TEXT,
    country TEXT,
    created_at INTEGER NOT NULL,
    is_replied TEXT NOT NULL DEFAULT 0,
    replied_at INTEGER
);

-- tracestack tables
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    priority TEXT,
    environment TEXT,
    tags TEXT,
    error_codes TEXT,
    project_name TEXT,
    estimated_time REAL,
    actual_time REAL,
    resolution_summary TEXT,
    rca_report_text TEXT,
    is_favorite INTEGER,
    created_by TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
);

CREATE TABLE session_entry (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    content TEXT NOT NULL,
    entry_type TEXT,
    status TEXT,
    duration REAL,
    commands_run TEXT,
    outcome TEXT,
    attachments TEXT,
    tags TEXT,
    timestamp TEXT NOT NULL,
    aerial_x INTEGER,
    aerial_y INTEGER,
    aerial_connections TEXT,
    created_by TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session (id) ON DELETE CASCADE
);

CREATE TABLE brainstorm_item (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    priority TEXT,
    status TEXT,
    created_by TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session (id) ON DELETE CASCADE
);

CREATE TABLE hypothesis (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence TEXT,
    status TEXT,
    test_plan TEXT,
    evidence TEXT,
    tags TEXT,
    created_by TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session (id) ON DELETE CASCADE
);

-- FTS5 virtual tables for full-text search
CREATE VIRTUAL TABLE sessions_fts USING fts5(title, description, tags, error_codes, project_name, resolution_summary, rca_report_text, content='session', content_rowid='id');
CREATE VIRTUAL TABLE session_entries_fts USING fts5(content, commands_run, outcome, tags, attachments, content='session_entry', content_rowid='id');
CREATE VIRTUAL TABLE brainstorm_items_fts USING fts5(content, category, priority, status, content='brainstorm_item', content_rowid='id');
CREATE VIRTUAL TABLE hypotheses_fts USING fts5(description, confidence, status, test_plan, evidence, tags, content='hypothesis', content_rowid='id');