CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	score INTEGER DEFAULT 0,
	level INTEGER DEFAULT 0,
	hidden INTEGER DEFAULT 0
);
CREATE TABLE finished_lessons (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	earned_score INTEGER, 
	time_to_finish INTEGER NOT NULL,
	lesson_id INTEGER NOT NULL
);


INSERT INTO users (username, password) VALUES ('admin', '$2b$12$Bf7RU727OpvGqrz2YVoUFeySGw3pl9rlnirzekA6eqAziuw2ztG8y');
