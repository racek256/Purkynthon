from typing import Dict, Any
from datetime import datetime
from modules.discord_bot import DiscordBot

class UserTracker:
    """Tracks active users and their status"""
    
    # In-memory storage of active users
    users: Dict[str, Dict[str, Any]] = {}
    
    @staticmethod
    def _generate_user_status(username: str) -> str:
        """Generate a status message for a user"""
        if username not in UserTracker.users:
            return "No status data"
        
        data = UserTracker.users[username]
        status = "Online" if data.get("logged_in", False) else "Offline"
        points = data.get("points", 0)
        theme = data.get("theme", "Unknown")
        last_activity = data.get("last_activity", "Never")
        
        lines = [
            f"**Current Status:** {status}",
            f"**Points:** {points}",
            f"**Theme:** {theme}",
            f"**Last Activity:** {last_activity}"
        ]
        
        return "\n".join(lines)
    
    @staticmethod
    def update_user(username: str, logged_in: bool = None, points: int = None, theme: str = None):
        """Update a user's status and log to their channel"""
        if username not in UserTracker.users:
            UserTracker.users[username] = {
                "logged_in": False,
                "points": 0,
                "theme": "Unknown",
                "last_activity": "Never"
            }
        
        user = UserTracker.users[username]
        
        if logged_in is not None:
            user["logged_in"] = logged_in
        if points is not None:
            user["points"] = points
        if theme is not None:
            user["theme"] = theme
        
        user["last_activity"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        
        # Send status update to user's channel
        status_message = UserTracker._generate_user_status(username)
        DiscordBot.send_log(username, "Status Updated", status_message, "blue")
