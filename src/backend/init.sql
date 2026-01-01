CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	score INTEGER DEFAULT 0,
	level INTEGER DEFAULT 1,
	role TEXT DEFAULT 'user'
);

CREATE TABLE settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);

CREATE TABLE notifications (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	message TEXT NOT NULL,
	type TEXT DEFAULT 'info',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	read INTEGER DEFAULT 0,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin user (password: brambora)
INSERT INTO users (username, password, role) VALUES ('admin', '$2b$12$Bf7RU727OpvGqrz2YVoUFeySGw3pl9rlnirzekA6eqAziuw2ztG8y', 'admin');

-- Default settings
INSERT INTO settings (key, value) VALUES ('ai_enabled', 'true');
INSERT INTO settings (key, value) VALUES ('maintenance_mode', 'false');
INSERT INTO settings (key, value) VALUES ('announcement', '');
INSERT INTO settings (key, value) VALUES ('session_version', '1');
INSERT INTO settings (key, value) VALUES ('force_logout_message', '');

