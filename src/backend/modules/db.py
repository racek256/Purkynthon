from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
import os 
import jwt  # pip install pyjwt
import datetime
from datetime import timedelta
from passlib.hash import bcrypt
from modules.standard_stuff import LoginData, JWT

SECRET_KEY = "This is our super secret key nobody will hack into our security HAHAHA you cant hack us you can try but you will fail because of this super secret key" # directly commited into a public repo btw
ALGORITHM = "HS256"  

router = APIRouter()


DB_FILE = "db.db"
DB_INIT = "init.sql"
ACCESS_TOKEN_EXPIRE_MINUTES = 180


if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    with open(DB_INIT,"r") as f:
        cur.executescript(f.read())
    conn.commit()
    conn.close()


def create_access_token(user_id, username,expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    expire = datetime.datetime.now(datetime.UTC) + timedelta(minutes=expires_minutes)
    payload = {
        "sub": str(user_id),       # user identifier
        "username": username,      # optional extra info
        "exp": expire,             # expiration time
        "iat": datetime.datetime.now(datetime.UTC)   # issued at
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
async def get_user(user:LoginData):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id,username,password FROM users WHERE username=?",(user.username,))
    user_data = cur.fetchone()
    conn.close()
    if user_data:
        print("user exist checking password")
        if bcrypt.verify(user.password,user_data[2]):
            print("generating JWT")
            jwt_token = create_access_token(user_data[0], user_data[1])
            return {"success":True, "jwt_token":jwt_token}
        else: 
            print("Password was incorrect")
            return {"success":False,"message":"password was incorrect"}
    else:
        return {"success":False, "message":"user doesnt exist"}


@router.post("/register")
async def register_user(user:LoginData):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Prepare user data
    try: 
        cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (user.username, bcrypt.hash(user.password)))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    user_id = cur.lastrowid
    conn.close()
    # Generate JWT_token
    jwt_token = create_access_token(user_id, user.username)
    return {"success":True, "jwt_token":jwt_token}

@router.post("/verify")
async def verify_jwt(data: JWT):
    try:
        payload = jwt.decode(data.jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]
        
        # Check if user still exists in database
        conn = sqlite3.connect(DB_FILE)
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE id=?", (user_id,))
        user = cur.fetchone()
        conn.close()
        
        if user:
            return {"success": True, "user_id": user_id, "username": payload["username"]}
        else:
            return {"success": False, "message": "User no longer exists"}
    except jwt.ExpiredSignatureError:
        return {"success": False, "message": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"success": False, "message": "Invalid token"}
