#!/usr/bin/env python3
"""Simple CLI script for adding users to the database."""

import sqlite3
import getpass
from passlib.hash import bcrypt

DB_FILE = "db.db"


def add_user(username: str, password: str) -> bool:
    """Add a user to the database. Returns True on success, False if user exists."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, bcrypt.hash(password)),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def main():
    print("=== Add User CLI ===")
    print("Enter empty username to quit.\n")

    while True:
        username = input("Username: ").strip()
        if not username:
            print("Exiting.")
            break

        password = getpass.getpass("Password: ")
        if not password:
            print("Password cannot be empty.\n")
            continue

        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match.\n")
            continue

        if add_user(username, password):
            print(f"User '{username}' added successfully.\n")
        else:
            print(f"User '{username}' already exists.\n")


if __name__ == "__main__":
    main()
