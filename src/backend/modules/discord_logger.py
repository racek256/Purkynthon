import requests
import json
import os
from typing import Literal
from datetime import datetime

class DiscordLogger:
    WEBHOOKS = {}
    
    # Load webhooks from JSON file
    @staticmethod
    def _load_webhooks():
        config_path = os.path.join(os.path.dirname(__file__), "..", "discord_webhooks.json")
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
                DiscordLogger.WEBHOOKS = config.get("webhooks", {})
        except Exception as e:
            print(f"Failed to load webhook config: {e}")
            DiscordLogger.WEBHOOKS = {}
    
    COLORS = {
        "general": 0x3498db,  # blue
        "success": 0x2ecc71,  # green
        "fail": 0xe74c3c,     # red
        "error": 0xf39c12     # yellow
    }
    
    @staticmethod
    def send(
        webhook_type: Literal["ai", "login", "running", "submitting"],
        title: str,
        description: str,
        color_type: Literal["general", "success", "fail", "error"] = "general",
        username: str = "Unknown"
    ):
        if not DiscordLogger.WEBHOOKS:
            DiscordLogger._load_webhooks()
            
        webhook_url = DiscordLogger.WEBHOOKS.get(webhook_type)
        if not webhook_url:
            print(f"Webhook URL for '{webhook_type}' not found")
            return
            
        color = DiscordLogger.COLORS[color_type]
        
        # Add username to title if provided
        if username != "Unknown":
            title = f"{title} - User: {username}"
        
        embed = {
            "title": title,
            "description": description,
            "color": color,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        payload = {
            "embeds": [embed]
        }
        
        try:
            response = requests.post(webhook_url, json=payload, timeout=5)
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to send Discord webhook: {e}")
    
    @staticmethod
    def send_startup_tests():
        DiscordLogger.send("ai", "AI Webhook Test", "AI webhook is working correctly", "general")
        DiscordLogger.send("login", "Login Webhook Test", "Login webhook is working correctly", "general")
        DiscordLogger.send("running", "Running Code Webhook Test", "Running code webhook is working correctly", "general")
        DiscordLogger.send("submitting", "Submitting Webhook Test", "Submitting webhook is working correctly", "general")
