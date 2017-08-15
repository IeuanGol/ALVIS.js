const Discord = require('discord.js');
const fs = require('fs');

class StartupCheck {
  constructor(bot) {
    this.bot = bot;
  }

  runConfigCheck() {
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
    if (!this.bot.config.hasOwnProperty("weather_underground_key") || typeof this.bot.config.weather_underground_key !== 'string'){
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
    if (!this.bot.config.hasOwnProperty("default_volume")){
      this.setDefaultConfig();
      return false;
    }
    if (!this.bot.config.hasOwnProperty("max_upload_size")){
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
    this.setEnabledServices();
    this.bot.util.logger("Startup Configuration Check PASSED");
    return true;
  }

  setDefaultConfig() {
    this.bot.util.logger("ERROR: Missing fields in config file; resetting to default config values.");
    var default_config = require("./Templates/default_config.json");
    fs.writeFile("./config/config.json", JSON.stringify(default_config, null, 4), function(err){
      if (err) console.log(err);
    });
  }

  setDefaultPermissions() {
    this.bot.util.logger("ERROR: Missing fields in permissions file; resetting to default permissions values.");
    var default_permissions = require("./Templates/default_permissions.json");
    fs.writeFile("./config/permissions.json", JSON.stringify(default_permissions, null, 4), function(err){
      if (err) console.log(err);
    });
  }

  setEnabledServices() {
    for (var service in this.bot.basic.services){
      if (this.bot.basic.services.hasOwnProperty(service)){
        this.bot.basic.services[service].active = false;
      }
    }
    if (this.bot.config.apiai_agent_token != "" && this.bot.config.apiai_agent_token != "YOUR_API.ai_AGENT_TOKEN"){
      this.enableService("APIai");
    }else{
      this.disableService("APIai");
    }
    if (this.bot.config.google_credentials.androidId != "" && this.bot.config.google_credentials.masterToken != ""){
      this.enableService("GooglePlayMusic");
    }else{
      this.disableService("GooglePlayMusic");
    }
    if (this.bot.config.wolfram_key != ""){
      this.enableService("Wolfram")
    }else{
      this.disableService("Wolfram");
    }
    if (this.bot.config.weather_underground_key != ""){
      this.enableService("WeatherUnderground");
    }else{
      this.disableService("WeatherUnderground");
    }
  }

  enableService(service) {
    if (this.bot.basic.services.hasOwnProperty(service)){
      this.bot.basic.services[service].active = true;
    }else{
      this.bot.basic.services[service] = {"active": true};
    }
  }

  disableService(service) {
    if (this.bot.basic.services.hasOwnProperty(service)){
      this.bot.basic.services[service].active = false;
    }else{
      this.bot.basic.services[service] = {"active": false};
    }
  }
}

module.exports = StartupCheck;
