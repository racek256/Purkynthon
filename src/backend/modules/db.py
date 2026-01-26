from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
import os
import jwt  # pip install pyjwt
import datetime
from datetime import timedelta
import bcrypt
from modules.standard_stuff import LoginData, JWT, LessonData
from modules.discord_logger import DiscordLogger

SECRET_KEY = "This is our super secret key nobody will hack into our security HAHAHA you cant hack us you can try but you will fail because of this super secret key"  # directly commited into a public repo btw
ALGORITHM = "HS256"

router = APIRouter()


DB_FILE = "db.db"
DB_INIT = "init.sql"
ACCESS_TOKEN_EXPIRE_MINUTES = 180


if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    with open(DB_INIT, "r") as f:
        cur.executescript(f.read())
    conn.commit()
    conn.close()


def create_access_token(
    user_id, username, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES
):
    expire = datetime.datetime.now(datetime.UTC) + timedelta(minutes=expires_minutes)
    payload = {
        "sub": str(user_id),  # user identifier
        "username": username,  # optional extra info
        "exp": expire,  # expiration time
        "iat": datetime.datetime.now(datetime.UTC),  # issued at
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


# Commented out, cuz what in the security catastrophe is this :sob:
# @router.get("/users")
# async def get_users():
#     conn = sqlite3.connect(DB_FILE)
#     cur = conn.cursor()
#     cur.execute("SELECT * FROM users")
#     users = cur.fetchall()
#     return users


@router.post("/login")
async def get_user(user: LoginData):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute(
        "SELECT id,username,password FROM users WHERE username=?", (user.username,)
    )
    user_data = cur.fetchone()
    conn.close()
    if user_data:
        # Use direct bcrypt to avoid passlib backend issues
        password_verified = False
        try:
            if bcrypt.checkpw(user.password.encode('utf-8'), user_data[2].encode('utf-8')):
                password_verified = True
        except ValueError as e:
            # Try with passlib as fallback for existing hashes
            from passlib.hash import bcrypt as passlib_bcrypt
            truncated_password = user.password[:72]
            try:
                if passlib_bcrypt.verify(truncated_password, user_data[2]):
                    password_verified = True
            except Exception:
                pass
        
        if password_verified:
            print("generating JWT")
            jwt_token = create_access_token(user_data[0], user_data[1])
            DiscordLogger.send("login", "User Login Success", f"User '{user.username}' logged in successfully", "success")
            return {"success": True, "jwt_token": jwt_token}
        else:
            print("Password was incorrect")
            DiscordLogger.send("login", "Login Failed", f"User '{user.username}' failed login - incorrect password", "fail")
            return {"success": False, "message": "password was incorrect"}
    else:
        DiscordLogger.send("login", "Login Failed", f"User '{user.username}' failed login - user does not exist", "fail")
        return {"success": False, "message": "user doesnt exist"}


@router.post("/register")
async def register_user(user: LoginData):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Prepare user data
    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (user.username, bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        DiscordLogger.send("login", "Registration Failed", f"User '{user.username}' registration failed - username already exists", "fail")
        raise HTTPException(status_code=400, detail="Username already exists")
    user_id = cur.lastrowid
    conn.close()
    # Generate JWT_token
    jwt_token = create_access_token(user_id, user.username)
    DiscordLogger.send("login", "User Registration Success", f"User '{user.username}' registered successfully", "success")
    return {"success": True, "jwt_token": jwt_token}


@router.post("/finished_lesson")
async def finish_lesson(data: LessonData):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    try:
        # Check if the user already completed this lesson
        cur.execute(
            "SELECT id FROM finished_lessons WHERE user_id=? AND lesson_id=?",
            (data.user_id, data.lesson_id),
        )
        already_finished = cur.fetchone()

        if already_finished:
            conn.close()
            DiscordLogger.send("submitting", "Lesson Submission Failed", f"User {data.user_id} already completed lesson {data.lesson_id}", "fail")
            return {"success": False, "message": "Lesson already completed"}

        # Create new row into table finished_lessons
        cur.execute(
            "INSERT INTO finished_lessons (lesson_id, user_id, earned_score, time_to_finish) VALUES (?, ?,?,?)",
            (data.lesson_id, data.user_id, data.score, data.time),
        )
        # add user his earned score
        # Get users current score and level
        res = cur.execute(
            "SELECT username, score, level FROM users WHERE id=(?)", (data.user_id,)
        )
        user_data = res.fetchone()
        print(user_data)
        username = user_data[0]
        new_score = data.score + user_data[1]
        # Increment the user's level (move to next lesson)
        new_level = user_data[2] + 1
        cur.execute(
            "UPDATE users SET score = (?), level = (?) WHERE id=(?)",
            (new_score, new_level, data.user_id),
        )
        DiscordLogger.send("submitting", "Lesson Completed", f"User '{username}' completed lesson {data.lesson_id}\nScore: {data.score}\nTime: {int(data.time / 1000)}s\nNew level: {new_level}", "success")
    except Exception as e:
        print(f"Something bad happend: {e}")
        conn.commit()
        conn.close()
        DiscordLogger.send("submitting", "Lesson Submission Error", f"Error submitting lesson for user {data.user_id}: {str(e)}", "error")
        raise HTTPException(
            status_code=400, detail="Error something id Eroooooor aaaaaaaaaaaaaahh"
        )
    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": "This was successfull yaaay",
        "new_level": new_level,
    }


@router.post("/verify")
async def verify_jwt(data: JWT):
    try:
        payload = jwt.decode(data.jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]

        # Check if user still exists in database and get their level
        conn = sqlite3.connect(DB_FILE)
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, level, score FROM users WHERE id=?", (user_id,)
        )
        user = cur.fetchone()
        conn.close()

        if user:
            return {
                "success": True,
                "user_id": user_id,
                "username": user[1],
                "level": user[2],
                "score": user[3],
            }
        else:
            return {"success": False, "message": "User no longer exists"}
    except jwt.ExpiredSignatureError:
        return {"success": False, "message": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"success": False, "message": "Invalid token"}


@router.post("/finish-summary")
async def finish_summary(data: JWT):
    try:
        payload = jwt.decode(data.jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])

        conn = sqlite3.connect(DB_FILE)
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, level, score FROM users WHERE id=?", (user_id,)
        )
        user = cur.fetchone()

        if not user:
            conn.close()
            return {"success": False, "message": "User not found"}

        cur.execute(
            "SELECT lesson_id, earned_score, time_to_finish FROM finished_lessons WHERE user_id=? ORDER BY id DESC LIMIT 1",
            (user_id,),
        )
        last_lesson = cur.fetchone()
        conn.close()

        last_data = None
        if last_lesson:
            last_data = {
                "lesson_id": last_lesson[0],
                "earned_score": last_lesson[1],
                "time_to_finish": last_lesson[2],
            }

        return {
            "success": True,
            "user_id": user[0],
            "username": user[1],
            "level": user[2],
            "score": user[3],
            "last_lesson": last_data,
        }
    except jwt.ExpiredSignatureError:
        return {"success": False, "message": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"success": False, "message": "Invalid token"}


@router.get("/lessons/current")
async def get_current_lesson(user_id: int):
    """Get the current lesson number for a user (next unfinished lesson)"""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT level FROM users WHERE id=?", (user_id,))
    user = cur.fetchone()
    conn.close()

    if user:
        # Level is 0-indexed, so lesson 1 = level 0
        return {"success": True, "lesson_number": user[0] + 1}
    else:
        return {"success": False, "message": "User not found"}


@router.get("/leaderboard")
async def get_leaderboard():
    """Get the leaderboard with all users sorted by score"""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, score, level FROM users ORDER BY score DESC LIMIT 50"
    )
    users = cur.fetchall()
    conn.close()

    leaderboard = [
        {"user_id": user[0], "username": user[1], "score": user[2], "level": user[3]}
        for user in users
    ]

    return {"success": True, "leaderboard": leaderboard}
