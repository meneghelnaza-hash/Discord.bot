import discord
from discord.ext import commands
import os

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Bot online: {bot.user} - Pronto pro NATALINO!")

@bot.tree.command(name="ping", description="Ver se o bot tá online")
async def ping(interaction: discord.Interaction):
    await interaction.response.send_message("Pong! Tô online no NATALINO! 🏓")

@bot.tree.command(name="natalino", description="Comando do Natalino")
async def natalino(interaction: discord.Interaction):
    await interaction.response.send_message("Fala NATALINO! Bot tá 100% online 🔥")

token = os.getenv("DISCORD_TOKEN")
bot.run(token)
