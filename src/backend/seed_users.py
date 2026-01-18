#!/usr/bin/env python3
"""Script to seed the database with test users for development/testing."""

import sqlite3
from passlib.hash import bcrypt

DB_FILE = "db.db"

# Test users to create
TEST_USERS = [
    {"username": "alice", "password": "password123", "score": 850, "level": 3},
    {"username": "bob", "password": "password123", "score": 720, "level": 2},
    {"username": "charlie", "password": "password123", "score": 950, "level": 4},
    {"username": "david", "password": "password123", "score": 600, "level": 2},
    {"username": "emma", "password": "password123", "score": 1100, "level": 5},
    {"username": "frank", "password": "password123", "score": 480, "level": 1},
    {"username": "grace", "password": "password123", "score": 790, "level": 3},
    {"username": "henry", "password": "password123", "score": 920, "level": 4},
    {"username": "ivy", "password": "password123", "score": 550, "level": 2},
    {"username": "jack", "password": "password123", "score": 1050, "level": 5},
]


def seed_users():
    """Add test users to the database."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    added = 0
    skipped = 0

    for user in TEST_USERS:
        try:
            hashed_password = bcrypt.hash(user["password"])
            cur.execute(
                "INSERT INTO users (username, password, score, level) VALUES (?, ?, ?, ?)",
                (user["username"], hashed_password, user["score"], user["level"]),
            )
            added += 1
            print(
                f"Added user: {user['username']} (score: {user['score']}, level: {user['level']})"
            )
        except sqlite3.IntegrityError:
            skipped += 1
            print(f"Skipped user (already exists): {user['username']}")

    conn.commit()
    conn.close()

    print(f"\nDone! Added: {added}, Skipped: {skipped}")


def list_users():
    """List all users in the database."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, username, score, level FROM users ORDER BY score DESC")
    users = cur.fetchall()
    conn.close()

    print("\n=== Current Users ===")
    print(f"{'ID':<4} {'Username':<15} {'Score':<8} {'Level':<6}")
    print("-" * 35)
    for user in users:
        print(f"{user[0]:<4} {user[1]:<15} {user[2]:<8} {user[3]:<6}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_users()
    else:
        print("=== Seeding Test Users ===\n")
        seed_users()
        list_users()
