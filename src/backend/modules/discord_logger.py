from typing import Literal
from modules.discord_bot import DiscordBot

class DiscordLogger:
    """Logger that sends messages to user-specific Discord channels via bot"""
    
    @staticmethod
    def send(
        log_type: Literal["ai", "login", "running", "submitting", "theme", "logout"],
        title: str,
        description: str,
        color_type: Literal["general", "success", "fail", "error"] = "general",
        username: str = "Unknown"
    ):
        """Send a log message to the user's Discord channel"""
        if username == "Unknown":
            print(f"Skipping log: {title} (no username)")
            return
        
        # Map color types to color names for the bot
        color_map = {
            "general": "blue",
            "success": "green",
            "fail": "red",
            "error": "yellow"
        }
        color = color_map.get(color_type, "blue")
        
        # Add log type to title
        full_title = f"[{log_type.upper()}] {title}"
        
        DiscordBot.send_log(username, full_title, description, color)
    
    @staticmethod
    def send_startup_test(username: str = "system"):
        """Send a startup test message"""
        DiscordBot.send_log(
            username,
            "Bot Started",
            "Discord bot has been initialized and is ready to log activities",
            "blue"
        )
    
    @staticmethod
    def log_theme_change(username: str, theme: str):
        """Log theme changes"""
        if theme.lower() == "flashbang":
            title = "FLASHBANG ALERT"
            description = f"A MANIAC has selected the FLASHBANG theme!"
            DiscordLogger.send("theme", title, description, "error", username)
        else:
            title = "Theme Changed"
            description = f"Switched to theme: {theme}"
            DiscordLogger.send("theme", title, description, "general", username)
