from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sqlite3
import jwt
from passlib.hash import bcrypt

SECRET_KEY = "This is our super secret key nobody will hack into our security HAHAHA you cant hack us you can try but you will fail because of this super secret key"
ALGORITHM = "HS256"
DB_FILE = "db.db"

router = APIRouter()


# Models
class TokenData(BaseModel):
    jwt_token: str

class RoleUpdate(BaseModel):
    jwt_token: str
    role: str

class AIToggle(BaseModel):
    jwt_token: str
    enabled: bool

class CreateUser(BaseModel):
    jwt_token: str
    username: str
    password: str
    role: str = "user"

class UpdatePassword(BaseModel):
    jwt_token: str
    password: str

class UpdateUsername(BaseModel):
    jwt_token: str
    username: str

class MaintenanceToggle(BaseModel):
    jwt_token: str
    enabled: bool

class AnnouncementUpdate(BaseModel):
    jwt_token: str
    message: str


def verify_admin_or_tester(jwt_token: str) -> dict:
    """Verify JWT and check if user is admin or tester. Returns user data."""
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]
        
        conn = sqlite3.connect(DB_FILE)
        cur = conn.cursor()
        cur.execute("SELECT id, username, role FROM users WHERE id=?", (user_id,))
        user = cur.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if user[2] not in ['admin', 'tester']:
            raise HTTPException(status_code=403, detail="Access denied. Admin or tester role required.")
        
        return {"id": user[0], "username": user[1], "role": user[2]}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def verify_admin_only(jwt_token: str) -> dict:
    """Verify JWT and check if user is admin. Returns user data."""
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]
        
        conn = sqlite3.connect(DB_FILE)
        cur = conn.cursor()
        cur.execute("SELECT id, username, role FROM users WHERE id=?", (user_id,))
        user = cur.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if user[2] != 'admin':
            raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
        
        return {"id": user[0], "username": user[1], "role": user[2]}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Admin Routes

@router.post("/users")
async def get_all_users(data: TokenData):
    """Get all users (admin/tester only). Does not expose passwords."""
    verify_admin_or_tester(data.jwt_token)
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, username, score, level, role FROM users")
    users = cur.fetchall()
    conn.close()
    
    return {
        "success": True,
        "users": [
            {
                "id": user[0],
                "username": user[1],
                "score": user[2],
                "level": user[3],
                "role": user[4]
            }
            for user in users
        ]
    }


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, data: TokenData):
    """Delete a user (admin only). Cannot delete yourself."""
    admin = verify_admin_only(data.jwt_token)
    
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    # Check if user exists
    cur.execute("SELECT id, username FROM users WHERE id=?", (user_id,))
    user = cur.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete the user
    cur.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": f"User '{user[1]}' deleted"}


@router.post("/users/create")
async def create_user(data: CreateUser):
    """Create a new user (admin only)."""
    verify_admin_only(data.jwt_token)
    
    if data.role not in ['user', 'tester', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'user', 'tester', or 'admin'")
    
    if len(data.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    
    if len(data.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    # Check if username already exists
    cur.execute("SELECT id FROM users WHERE username=?", (data.username,))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create the user
    hashed_password = bcrypt.hash(data.password)
    cur.execute(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        (data.username, hashed_password, data.role)
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    
    return {
        "success": True,
        "message": f"User '{data.username}' created",
        "user": {
            "id": user_id,
            "username": data.username,
            "role": data.role,
            "score": 0,
            "level": 1
        }
    }


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, data: RoleUpdate):
    """Update a user's role (admin only). Cannot change your own role."""
    admin = verify_admin_only(data.jwt_token)
    
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    if data.role not in ['user', 'tester', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'user', 'tester', or 'admin'")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    # Check if user exists and get current role
    cur.execute("SELECT id, username, role FROM users WHERE id=?", (user_id,))
    user = cur.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = user[2]
    
    # Update the role
    cur.execute("UPDATE users SET role=? WHERE id=?", (data.role, user_id))
    
    # Create notification for the user about role change
    notification_msg = f"Your role has been changed from '{old_role}' to '{data.role}' by an administrator."
    cur.execute(
        "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
        (user_id, notification_msg, "role_change")
    )
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": f"User '{user[1]}' role updated to '{data.role}'"}


@router.put("/users/{user_id}/password")
async def update_user_password(user_id: int, data: UpdatePassword):
    """Update a user's password (admin only). Cannot change your own password here."""
    admin = verify_admin_only(data.jwt_token)
    
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own password from admin panel")
    
    if len(data.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    # Check if user exists
    cur.execute("SELECT id, username FROM users WHERE id=?", (user_id,))
    user = cur.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the password
    hashed_password = bcrypt.hash(data.password)
    cur.execute("UPDATE users SET password=? WHERE id=?", (hashed_password, user_id))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": f"Password updated for user '{user[1]}'"}


@router.put("/users/{user_id}/username")
async def update_user_username(user_id: int, data: UpdateUsername):
    """Update a user's username (admin only). Cannot change your own username here."""
    admin = verify_admin_only(data.jwt_token)
    
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own username from admin panel")
    
    if len(data.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    # Check if user exists
    cur.execute("SELECT id, username FROM users WHERE id=?", (user_id,))
    user = cur.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if new username is taken
    cur.execute("SELECT id FROM users WHERE username=? AND id!=?", (data.username, user_id))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already taken")
    
    old_username = user[1]
    
    # Update the username
    cur.execute("UPDATE users SET username=? WHERE id=?", (data.username, user_id))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": f"Username changed from '{old_username}' to '{data.username}'", "new_username": data.username}


# Settings Routes

@router.get("/settings")
async def get_settings(jwt_token: str):
    """Get all system settings (admin only)."""
    verify_admin_only(jwt_token)
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT key, value FROM settings")
    settings = cur.fetchall()
    conn.close()
    
    return {
        "success": True,
        "settings": {setting[0]: setting[1] for setting in settings}
    }


@router.put("/settings/ai")
async def toggle_ai(data: AIToggle):
    """Toggle AI on/off (admin only)."""
    verify_admin_only(data.jwt_token)
    
    value = "true" if data.enabled else "false"
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("UPDATE settings SET value=? WHERE key='ai_enabled'", (value,))
    conn.commit()
    conn.close()
    
    return {"success": True, "ai_enabled": data.enabled}


# Public route to check AI status
@router.get("/ai-status")
async def get_ai_status():
    """Check if AI is enabled (public endpoint for frontend)."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key='ai_enabled'")
    result = cur.fetchone()
    conn.close()
    
    ai_enabled = result[0] == "true" if result else True
    
    return {"ai_enabled": ai_enabled}


# Maintenance Mode Routes

@router.put("/settings/maintenance")
async def toggle_maintenance(data: MaintenanceToggle):
    """Toggle maintenance mode on/off (admin only)."""
    verify_admin_only(data.jwt_token)
    
    value = "true" if data.enabled else "false"
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("UPDATE settings SET value=? WHERE key='maintenance_mode'", (value,))
    conn.commit()
    conn.close()
    
    return {"success": True, "maintenance_mode": data.enabled}


@router.get("/maintenance-status")
async def get_maintenance_status():
    """Check if maintenance mode is enabled (public endpoint)."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key='maintenance_mode'")
    result = cur.fetchone()
    conn.close()
    
    maintenance_mode = result[0] == "true" if result else False
    
    return {"maintenance_mode": maintenance_mode}


# Announcement Routes

@router.put("/settings/announcement")
async def update_announcement(data: AnnouncementUpdate):
    """Update the announcement message (admin only). Empty string clears it."""
    verify_admin_only(data.jwt_token)
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("UPDATE settings SET value=? WHERE key='announcement'", (data.message,))
    conn.commit()
    conn.close()
    
    return {"success": True, "announcement": data.message}


@router.get("/announcement")
async def get_announcement():
    """Get current announcement (public endpoint)."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key='announcement'")
    result = cur.fetchone()
    conn.close()
    
    return {"announcement": result[0] if result else ""}


@router.post("/settings/announcement/clear")
async def clear_announcement():
    """Clear the announcement (public endpoint for auto-expiration)."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("UPDATE settings SET value='' WHERE key='announcement'")
    conn.commit()
    conn.close()
    
    return {"success": True, "announcement": ""}


# Session Management Routes

@router.post("/force-logout-all")
async def force_logout_all(data: TokenData):
    """Invalidate all user sessions by incrementing session version (admin only)."""
    verify_admin_only(data.jwt_token)
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key='session_version'")
    result = cur.fetchone()
    current_version = int(result[0]) if result else 1
    new_version = current_version + 1
    cur.execute("UPDATE settings SET value=? WHERE key='session_version'", (str(new_version),))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "All users have been logged out", "new_session_version": new_version}


@router.get("/session-version")
async def get_session_version():
    """Get current session version (public endpoint for session validation)."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key='session_version'")
    result = cur.fetchone()
    conn.close()
    
    return {"session_version": int(result[0]) if result else 1}


# Stats Routes

@router.post("/stats")
async def get_stats(data: TokenData):
    """Get system statistics (admin/tester only)."""
    verify_admin_or_tester(data.jwt_token)
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    
    # Total users
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]
    
    # Users by role
    cur.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
    users_by_role = {row[0]: row[1] for row in cur.fetchall()}
    
    # Average score
    cur.execute("SELECT AVG(score) FROM users")
    avg_score = cur.fetchone()[0] or 0
    
    # Average level
    cur.execute("SELECT AVG(level) FROM users")
    avg_level = cur.fetchone()[0] or 0
    
    # Highest score
    cur.execute("SELECT username, score FROM users ORDER BY score DESC LIMIT 1")
    top_scorer = cur.fetchone()
    
    # Highest level
    cur.execute("SELECT username, level FROM users ORDER BY level DESC LIMIT 1")
    top_level = cur.fetchone()
    
    # Total score
    cur.execute("SELECT SUM(score) FROM users")
    total_score = cur.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "success": True,
        "stats": {
            "total_users": total_users,
            "users_by_role": users_by_role,
            "average_score": round(avg_score, 1),
            "average_level": round(avg_level, 1),
            "total_score": total_score,
            "top_scorer": {"username": top_scorer[0], "score": top_scorer[1]} if top_scorer else None,
            "top_level": {"username": top_level[0], "level": top_level[1]} if top_level else None
        }
    }


# Public status endpoint (for checking maintenance, announcement, etc.)
@router.get("/status")
async def get_public_status():
    """Get public status info (maintenance mode, announcement, session version)."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT key, value FROM settings WHERE key IN ('maintenance_mode', 'announcement', 'session_version', 'force_logout_message')")
    results = {row[0]: row[1] for row in cur.fetchall()}
    conn.close()
    
    return {
        "maintenance_mode": results.get("maintenance_mode", "false") == "true",
        "announcement": results.get("announcement", ""),
        "session_version": int(results.get("session_version", "1")),
        "force_logout_message": results.get("force_logout_message", "")
    }


# Notification Routes

@router.post("/notifications")
async def get_user_notifications(data: TokenData):
    """Get unread notifications for the current user."""
    try:
        payload = jwt.decode(data.jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, message, type, created_at FROM notifications WHERE user_id=? AND read=0 ORDER BY created_at DESC",
        (user_id,)
    )
    notifications = cur.fetchall()
    conn.close()
    
    return {
        "success": True,
        "notifications": [
            {
                "id": n[0],
                "message": n[1],
                "type": n[2],
                "created_at": n[3]
            }
            for n in notifications
        ]
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, data: TokenData):
    """Mark a notification as read."""
    try:
        payload = jwt.decode(data.jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute(
        "UPDATE notifications SET read=1 WHERE id=? AND user_id=?",
        (notification_id, user_id)
    )
    conn.commit()
    conn.close()
    
    return {"success": True}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(data: TokenData):
    """Mark all notifications as read for the current user."""
    try:
        payload = jwt.decode(data.jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("UPDATE notifications SET read=1 WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()
    
    return {"success": True}


@router.post("/clear-force-logout-message")
async def clear_force_logout_message():
    """Clear the force logout message after it's been shown."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("UPDATE settings SET value='' WHERE key='force_logout_message'")
    conn.commit()
    conn.close()
    
    return {"success": True}
