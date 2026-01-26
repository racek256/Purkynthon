import discord
from discord.ext import commands
import json
import os
import asyncio
from typing import Dict, Optional
from datetime import datetime
import threading

class DiscordBot:
    """Discord bot that creates and manages user-specific logging channels"""
    
    bot: Optional[commands.Bot] = None
    guild: Optional[discord.Guild] = None
    user_channels: Dict[str, discord.TextChannel] = {}
    token: str = ""
    guild_id: int = 0
    _loop: Optional[asyncio.AbstractEventLoop] = None
    _ready = False
    
    @staticmethod
    def _load_config():
        """Load bot configuration from JSON file"""
        config_path = os.path.join(os.path.dirname(__file__), "..", "discord_bot_config.json")
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
                DiscordBot.token = config.get("bot_token", "")
                DiscordBot.guild_id = int(config.get("guild_id", "0"))
        except Exception as e:
            print(f"Failed to load bot config: {e}")
    
    @staticmethod
    async def _setup_bot():
        """Initialize the Discord bot"""
        intents = discord.Intents.default()
        intents.guilds = True
        intents.messages = True
        
        DiscordBot.bot = commands.Bot(command_prefix="!", intents=intents)
        
        @DiscordBot.bot.event
        async def on_ready():
            print(f"Discord bot logged in as {DiscordBot.bot.user}")
            DiscordBot.guild = DiscordBot.bot.get_guild(DiscordBot.guild_id)
            if DiscordBot.guild:
                print(f"Connected to guild: {DiscordBot.guild.name}")
                await DiscordBot._load_user_channels()
            else:
                print(f"Could not find guild with ID {DiscordBot.guild_id}")
            DiscordBot._ready = True
        
        try:
            await DiscordBot.bot.start(DiscordBot.token)
        except Exception as e:
            print(f"Failed to start Discord bot: {e}")
    
    @staticmethod
    async def _load_user_channels():
        """Load existing user channels from the guild"""
        if not DiscordBot.guild:
            return
        
        for channel in DiscordBot.guild.text_channels:
            if channel.name.startswith("user-"):
                username = channel.name[5:]  # Remove "user-" prefix
                DiscordBot.user_channels[username] = channel
                print(f"Found existing channel for user: {username}")
    
    @staticmethod
    def _run_bot():
        """Run the bot in a separate thread"""
        DiscordBot._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(DiscordBot._loop)
        DiscordBot._loop.run_until_complete(DiscordBot._setup_bot())
    
    @staticmethod
    def start():
        """Start the Discord bot in a background thread"""
        DiscordBot._load_config()
        bot_thread = threading.Thread(target=DiscordBot._run_bot, daemon=True)
        bot_thread.start()
        print("Discord bot thread started")
        
        # Wait for bot to be ready
        for _ in range(30):  # Wait up to 30 seconds
            if DiscordBot._ready:
                break
            import time
            time.sleep(1)
    
    @staticmethod
    async def _get_or_create_channel(username: str) -> Optional[discord.TextChannel]:
        """Get or create a channel for a specific user"""
        if not DiscordBot.guild:
            print("Bot not connected to guild")
            return None
        
        # Check if channel already exists
        if username in DiscordBot.user_channels:
            return DiscordBot.user_channels[username]
        
        # Create new channel
        channel_name = f"user-{username.lower()}"
        try:
            channel = await DiscordBot.guild.create_text_channel(
                channel_name,
                topic=f"Activity logs for {username}"
            )
            DiscordBot.user_channels[username] = channel
            print(f"Created channel for user: {username}")
            return channel
        except Exception as e:
            print(f"Failed to create channel for {username}: {e}")
            return None
    
    @staticmethod
    def send_log(username: str, title: str, message: str, color: str = "blue"):
        """Send a log message to a user's channel"""
        if not DiscordBot._ready or not DiscordBot.bot:
            print(f"Bot not ready, skipping log for {username}")
            return
        
        # Map color names to Discord color values
        color_map = {
            "blue": 0x3498db,
            "green": 0x2ecc71,
            "red": 0xe74c3c,
            "yellow": 0xf39c12
        }
        color_value = color_map.get(color, 0x3498db)
        
        # Schedule the async task
        if DiscordBot._loop:
            asyncio.run_coroutine_threadsafe(
                DiscordBot._send_log_async(username, title, message, color_value),
                DiscordBot._loop
            )
    
    @staticmethod
    async def _send_log_async(username: str, title: str, message: str, color: int):
        """Async function to send log message"""
        channel = await DiscordBot._get_or_create_channel(username)
        if not channel:
            return
        
        embed = discord.Embed(
            title=title,
            description=message,
            color=color,
            timestamp=datetime.utcnow()
        )
        
        try:
            await channel.send(embed=embed)
        except Exception as e:
            print(f"Failed to send message to {username}'s channel: {e}")
