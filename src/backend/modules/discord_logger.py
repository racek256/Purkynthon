import requests
from typing import Literal
from datetime import datetime

class DiscordLogger:
    WEBHOOKS = {
        "ai": "https://discord.com/api/webhooks/1463795204061532321/gjzmmAPq1rBIThQCX_9cBRBqmvu2c9JOCG96EpPC8kH_FX5A4ibV-bXgwcyQz1cnqEDl",
        "login": "https://discord.com/api/webhooks/1463794980450598993/1OWbCh5V6bnu0MqhIeFvjRgpsUuDg9WuuK515jdKWJA_Ook-HcsGDyyeEMN4vfA8BZ2h",
        "running": "https://discord.com/api/webhooks/1463795108372811952/ZjSjPeKNU5tEkPtm03x1EhmXSUZv2xWtukv-nzz5q2h-kWYJTHrPx3mKt2WJpiOjxRzm",
        "submitting": "https://discord.com/api/webhooks/1463795157299363882/8DxmQozNGSgNMAS8uE9yKpH2OoSGRClC2v6VLxxg4uUFbdGhaLlITLOsmMh6YifFO1GA"
    }
    
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
        color_type: Literal["general", "success", "fail", "error"] = "general"
    ):
        webhook_url = DiscordLogger.WEBHOOKS[webhook_type]
        color = DiscordLogger.COLORS[color_type]
        
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
        DiscordLogger.send("ai", "AI Webhook Test", "AI webhook is spying correctly", "general")
        DiscordLogger.send("login", "Login Webhook Test", "Login webhook is spying correctly", "general")
        DiscordLogger.send("running", "Running Code Webhook Test", "Running code webhook is spying correctly", "general")
        DiscordLogger.send("submitting", "Submitting Webhook Test", "Submitting webhook is spying correctly", "general")
