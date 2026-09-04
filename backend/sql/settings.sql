-- جدول إعدادات المستخدم
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    settings JSON DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- جدول سجل التدقيق للإعدادات
CREATE TABLE IF NOT EXISTS setting_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL,
    old_value JSON,
    new_value JSON,
    scope TEXT NOT NULL,
    scope_id TEXT,
    source TEXT NOT NULL,
    confirmed BOOLEAN DEFAULT 0,
    actor_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_setting_audit_key ON setting_audit_logs(setting_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);