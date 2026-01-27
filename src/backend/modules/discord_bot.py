import discord
from discord.ext import commands
import json
import os
import asyncio
import sqlite3
import re
from typing import Dict, Optional
from datetime import datetime
import threading

class DiscordBot:
    """Discord bot that creates and manages user-specific logging channels"""
    
    bot: Optional[commands.Bot] = None
    guild: Optional[discord.Guild] = None
    user_channels: Dict[str, discord.TextChannel] = {}
    user_stats: Dict[str, Dict] = {}  # Cache for user stats
    token: str = ""
    guild_id: int = 0
    _loop: Optional[asyncio.AbstractEventLoop] = None
    _ready = False
    _shutdown_started = False
    
    @staticmethod
    def _username_to_channel(username: str) -> str:
        slug = re.sub(r"[^a-z0-9-]", "-", username.lower())
        slug = re.sub(r"-+", "-", slug).strip("-")
        return slug

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
            
            # List all available guilds
            print(f"Bot is in {len(DiscordBot.bot.guilds)} guild(s):")
            for guild in DiscordBot.bot.guilds:
                print(f"  - {guild.name} (ID: {guild.id})")
            
            DiscordBot.guild = DiscordBot.bot.get_guild(DiscordBot.guild_id)
            if DiscordBot.guild:
                print(f"Connected to guild: {DiscordBot.guild.name}")
                await DiscordBot._load_user_channels()
            else:
                print(f"Could not find guild with ID {DiscordBot.guild_id}")
                # Try to use the first available guild
                if DiscordBot.bot.guilds:
                    DiscordBot.guild = DiscordBot.bot.guilds[0]
                    print(f"Using first available guild: {DiscordBot.guild.name} (ID: {DiscordBot.guild.id})")
                    await DiscordBot._load_user_channels()
            DiscordBot._ready = True
        
        try:
            await DiscordBot.bot.start(DiscordBot.token)
        except Exception as e:
            print(f"Failed to start Discord bot: {e}")
    
    @staticmethod
    async def _load_user_channels():
        """Load existing user channels from the guild and create missing ones"""
        if not DiscordBot.guild:
            return
        
        # Load existing channels
        for channel in DiscordBot.guild.text_channels:
            if channel.name.startswith("user-"):
                slug = channel.name[5:]  # Remove "user-" prefix
                DiscordBot.user_channels[slug] = channel
                print(f"Found existing channel for user: {slug}")
        
        # Get all users from the database
        db_path = os.path.join(os.path.dirname(__file__), "..", "db.db")
        if not os.path.exists(db_path):
            print("Database file not found, skipping user channel creation")
            return
        
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute("SELECT username FROM users")
            users = cur.fetchall()
            conn.close()
            
            db_usernames = {DiscordBot._username_to_channel(user_row[0]) for user_row in users}
            print(f"Found {len(users)} users in database")

            removed = 0
            prune_orphans = os.getenv("DISCORD_PRUNE_ORPHAN_CHANNELS", "false").lower() == "true"
            if prune_orphans:
                for slug, channel in list(DiscordBot.user_channels.items()):
                    if slug not in db_usernames:
                        try:
                            print(f"Deleting channel for removed user: {slug}")
                            await channel.delete(reason="User removed from database")
                            DiscordBot.user_channels.pop(slug, None)
                            removed += 1
                        except Exception as e:
                            print(f"Failed to delete channel for {slug}: {e}")
            
            # Create channels for users that don't have one
            existing_channel_names = {name.lower() for name in DiscordBot.user_channels.keys()}
            for user_row in users:
                username = user_row[0]
                slug = DiscordBot._username_to_channel(username)
                if slug not in existing_channel_names:
                    print(f"Creating channel for user: {username}")
                    await DiscordBot._get_or_create_channel(username)
                # Update channel description for all users
                await DiscordBot._update_channel_description(username)
            
            print(
                f"Channel setup complete. Total channels: {len(DiscordBot.user_channels)} (removed: {removed})"
            )
        except Exception as e:
            print(f"Failed to load users from database: {e}")
    
    @staticmethod
    def _run_bot():
        """Run the bot in a separate thread"""
        DiscordBot._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(DiscordBot._loop)
        try:
            DiscordBot._loop.run_until_complete(DiscordBot._setup_bot())
        finally:
            DiscordBot._ready = False
            if DiscordBot._loop and not DiscordBot._loop.is_closed():
                DiscordBot._loop.close()
            DiscordBot._loop = None
    
    @staticmethod
    def start():
        """Start the Discord bot in a background thread"""
        DiscordBot._load_config()
        DiscordBot._shutdown_started = False
        DiscordBot._ready = False
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
    async def _shutdown():
        """Properly shutdown the bot and close connections"""
        if DiscordBot.bot:
            await DiscordBot.bot.close()
        DiscordBot._ready = False
    
    @staticmethod
    def shutdown():
        """Shutdown the Discord bot gracefully"""
        if DiscordBot._shutdown_started:
            return
        DiscordBot._shutdown_started = True

        if not DiscordBot._loop or not DiscordBot.bot:
            return
        if DiscordBot._loop.is_closed() or not DiscordBot._loop.is_running():
            return

        future = asyncio.run_coroutine_threadsafe(
            DiscordBot._shutdown(),
            DiscordBot._loop
        )
        try:
            future.result(timeout=5)
        except TimeoutError:
            print("Discord bot shutdown timed out, cancelling...")
            future.cancel()
        except Exception as e:
            print(f"Discord bot shutdown error: {e}")
    
    @staticmethod
    async def _get_or_create_channel(username: str) -> Optional[discord.TextChannel]:
        """Get or create a channel for a specific user"""
        if not DiscordBot.guild:
            print("Bot not connected to guild")
            return None
        
        slug = DiscordBot._username_to_channel(username)
        # Check if channel already exists
        if slug in DiscordBot.user_channels:
            return DiscordBot.user_channels[slug]
        
        # Create new channel
        channel_name = f"user-{slug}"
        try:
            channel = await DiscordBot.guild.create_text_channel(
                channel_name,
                topic=f"Activity logs for {username}"
            )
            DiscordBot.user_channels[slug] = channel
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
            # Update channel description after sending log
            await DiscordBot._update_channel_description(username)
        except Exception as e:
            print(f"Failed to send message to {username}'s channel: {e}")
    
    @staticmethod
    def _get_user_stats_from_db(username: str) -> Dict:
        """Get user statistics from database"""
        db_path = os.path.join(os.path.dirname(__file__), "..", "db.db")
        if not os.path.exists(db_path):
            return {}
        
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            
            # Get user data
            cur.execute("SELECT id, score, level FROM users WHERE username=?", (username,))
            user_data = cur.fetchone()
            
            if not user_data:
                conn.close()
                return {}
            
            user_id, score, level = user_data
            
            # Get finished lessons count
            cur.execute("SELECT COUNT(*) FROM finished_lessons WHERE user_id=?", (user_id,))
            lessons_finished = cur.fetchone()[0]
            
            conn.close()
            
            return {
                "score": score,
                "level": level,
                "lessons_finished": lessons_finished,
                "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            }
        except Exception as e:
            print(f"Failed to get user stats for {username}: {e}")
            return {}
    
    @staticmethod
    async def _update_channel_description(username: str):
        """Update channel topic/description with user stats"""
        slug = DiscordBot._username_to_channel(username)
        if slug not in DiscordBot.user_channels:
            return
        
        channel = DiscordBot.user_channels[slug]
        
        # Get user stats
        stats = DiscordBot._get_user_stats_from_db(username)
        if not stats:
            return
        
        # Check if user is logged in (from user_stats cache)
        logged_in_status = "Online" if DiscordBot.user_stats.get(username, {}).get("logged_in", False) else "Offline"
        theme = DiscordBot.user_stats.get(username, {}).get("theme", "Unknown")
        
        # Build description
        description = (
            f"Activity logs for {username} | "
            f"Status: {logged_in_status} | "
            f"Points: {stats['score']} | "
            f"Level: {stats['level']} | "
            f"Lessons Finished: {stats['lessons_finished']} | "
            f"Theme: {theme} | "
            f"Updated: {stats['last_updated']}"
        )
        
        try:
            await channel.edit(topic=description)
        except Exception as e:
            print(f"Failed to update channel description for {username}: {e}")
    
    @staticmethod
    def update_user_status(username: str, logged_in: bool = None, theme: str = None):
        """Update user status cache"""
        if username not in DiscordBot.user_stats:
            DiscordBot.user_stats[username] = {
                "logged_in": False,
                "theme": "Unknown"
            }
        
        if logged_in is not None:
            DiscordBot.user_stats[username]["logged_in"] = logged_in
        if theme is not None:
            DiscordBot.user_stats[username]["theme"] = theme
        
        # Schedule channel description update
        if DiscordBot._loop:
            asyncio.run_coroutine_threadsafe(
                DiscordBot._update_channel_description(username),
                DiscordBot._loop
            )
