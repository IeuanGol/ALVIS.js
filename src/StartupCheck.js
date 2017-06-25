const Discord = require('discord.js');
const fs = require('fs');

class StartupCheck {
  constructor(bot) {
    this.bot = bot;
  }

  runCheck() {
    this.bot.util.logger("Startup Configuration Check INITIATED");
    if (!this.bot.config.hasOwnProperty("discord_token") || typeof this.bot.config.discord_token !== 'string'){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("apiai_agent_token") || typeof this.bot.config.apiai_agent_token !== 'string'){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("wolfram_key") || typeof this.bot.config.wolfram_key !== 'string'){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("google_credentials")){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.google_credentials.hasOwnProperty("androidId") || !this.bot.config.google_credentials.hasOwnProperty("masterToken")){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("bot_game") || typeof this.bot.config.bot_game !== 'string'){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("bot_game_link") || typeof this.bot.config.bot_game_link !== 'string'){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("deleteMessages") || typeof this.bot.config.deleteMessages !== 'boolean'){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.permissions.hasOwnProperty("manager_role") || typeof this.bot.permissions.manager_role !== 'string'){
      this.setDefaultPermissions();
      return false;
    }
    if (!this.bot.permissions.hasOwnProperty("admin_role") || typeof this.bot.permissions.admin_role !== 'string'){
      this.setDefaultPermissions();
      return false;
    }
    if (!this.bot.permissions.hasOwnProperty("default_role") || typeof this.bot.permissions.default_role !== 'string'){
      this.setDefaultPermissions();
      return false;
    }
    if (this.bot.config.discord_token == "" || this.bot.config.discord_token == "YOUR_DISCORD_BOT_TOKEN"){
      console.log("ERROR: Discord bot token not configured. Please configure your token in './config/config.json'. See README for more information.");
      return false;
    }
    if (this.bot.config.apiai_agent_token == "" || this.bot.config.apiai_agent_token == "YOUR_API.AI_AGENT_TOKEN"){
      console.log("ERROR: API.AI agent token not configured. Please configure your token in './config/config.json'. See README for more information.");
      return false;
    }
    if (this.bot.permissions.manager_role == ""){
      console.log("ERROR: Manager role not configured. Please configure bot-permission roles in './config/permissions.json'. See README for more information.");
      return false;
    }
    if (this.bot.permissions.admin_role == ""){
      console.log("ERROR: Admin role not configured. Please configure bot-permission roles in './config/permissions.json'. See README for more information.");
      return false;
    }
    this.bot.util.logger("Startup Configuration Check PASSED");
    return true;
  }

  setDefaultConfig() {
    var json_data = {"discord_token": "YOUR_DISCORD_BOT_TOKEN", "apiai_agent_token": "YOUR_API.AI_AGENT_TOKEN", "wolfram_key": "YOUR_WOLFRAM_API_KEY", "google_credentials": {"androidId": "", "masterToken": ""}, "bot_game": "by PacketCloud™", "bot_game_link": "", "deleteMessages": true};
    fs.writeFile("./config/config.json", JSON.stringify(json_data, null, 4), function(err){
      if (err) console.log(err);
    });
    this.bot.util.logger("ERROR: Missing fields in config file; resetting to default config values.");
  }

  setDefaultPermissions() {
    var json_data = {"manager_role": "", "admin_role": "", "default_role": ""};
    fs.writeFile("./config/permissions.json", JSON.stringify(json_data, null, 4), function(err){
      if (err) console.log(err);
    });
    this.bot.util.logger("ERROR: Missing fields in permissions file; resetting to default permissions values.");
  }
}

module.exports = StartupCheck;
