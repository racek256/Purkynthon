CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	score INTEGER DEFAULT 0,
	level INTEGER DEFAULT 1
);


INSERT INTO users (username, password) VALUES ('admin', '$2b$12$Bf7RU727OpvGqrz2YVoUFeySGw3pl9rlnirzekA6eqAziuw2ztG8y');

