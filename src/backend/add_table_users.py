#!/usr/bin/env python3
"""Script to add the specific users from the table to the database."""

import sqlite3
from passlib.hash import bcrypt

DB_FILE = "db.db"

# Users from the provided table
USERS_TO_ADD = [
    {"username": "racek256", "password": "race"},
    {"username": "itsfimes", "password": "itsf"},
    {"username": "its.rakon", "password": "its."},
    {"username": "martin40645", "password": "mart"},
    {"username": "vh8t", "password": "vh8t"},
    {"username": "thechosenzendro", "password": "thec"},
    {"username": "setraider093557", "password": "setr"},
    {"username": "brave_lemur_09132", "password": "brav"},
    {"username": "pepe_30735", "password": "pepe"},
    {"username": "pascal.jurav2", "password": "pasc"},
    {"username": "barunka5253", "password": "baru"},
    {"username": ".werlog", "password": "werl"},
    {"username": "laughtea46", "password": "laug"},
    {"username": "sn0wix_", "password": "sn0w"},
    {"username": "sunightmc", "password": "suni"},
    {"username": "samo77788", "password": "samo"},
    {"username": "lukasjarolim", "password": "luka"},
    {"username": "radekminecraft", "password": "rade"},
    {"username": "ledaka_cz", "password": "leda"},
    {"username": "hajekt", "password": "haje"},
    {"username": "pascal.jura", "password": "pasc"},
    {"username": "lenka.japko6972", "password": "lenk"},
    {"username": "quote2073", "password": "quot"},
    {"username": "ondatraa380", "password": "onda"},
    {"username": "jerrrry", "password": "jerr"},
    {"username": "divear", "password": "dive"},
    {"username": "matkolo2", "password": "matk"},
    {"username": "vypal420", "password": "vypa"},
]


def add_users():
    """Add all users from the table to the database."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    added = 0
    skipped = 0

    for user in USERS_TO_ADD:
        try:
            # Hash password using bcrypt (same as the seed_users script)
            hashed_password = bcrypt.hash(user["password"])
            
            cur.execute(
                "INSERT INTO users (username, password, score, level) VALUES (?, ?, ?, ?)",
                (user["username"], hashed_password, 0, 0),  # Start with score=0, level=0
            )
            added += 1
            print(f"Added user: {user['username']}")
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
    cur.execute("SELECT id, username, score, level FROM users ORDER BY id")
    users = cur.fetchall()
    conn.close()

    print("\n=== All Users in Database ===")
    print(f"{'ID':<4} {'Username':<20} {'Score':<8} {'Level':<6}")
    print("-" * 42)
    for user in users:
        print(f"{user[0]:<4} {user[1]:<20} {user[2]:<8} {user[3]:<6}")


if __name__ == "__main__":
    print("=== Adding Users from Table ===\n")
    add_users()
    list_users()