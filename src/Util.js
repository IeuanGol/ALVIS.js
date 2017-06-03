const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ResponseHandler = require('./AI/ResponseHandler.js');

class Util {
  constructor(bot) {
    this.bot = bot;
    this.responseHandler = bot.responseHandler;
    this.musicData = require("." + this.bot.basic.music_path + "/music.json");
    this.soundData = require("." + this.bot.basic.sound_path + "/sounds.json");
  }

  logger(string) {
    const currentTime = new Date();
  	const time = "[" + ("0" + currentTime.getHours()).slice(-2) + ":" + ("0" + currentTime.getMinutes()).slice(-2) + ":" + ("0" + currentTime.getSeconds()).slice(-2) + "] ";
  	console.log(time + string);
  }

  logStandardCommand(message, command) {
    if (message.channel instanceof Discord.TextChannel) {
			this.logger("Responded to '" + this.bot.basic.command_prefix + command + "' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
		}else {
      this.logger("Responded to '" + this.bot.basic.command_prefix + command + "' command from " + message.author.username);
    }
  }

  queryBotResponse(message) {
    var query_message = message.cleanContent;
    if (message.channel instanceof Discord.TextChannel) query_message = query_message.replace(this.bot.basic.username, "").replace(/@/g, "");
    if (query_message.length < 1) query_message = "?";
    var handler = this.responseHandler;
    var request = this.bot.chatbot.textRequest(query_message, {
      sessionId: message.author.id.toString()
    });
    request.on('response', function(response) {
      handler.handle(message, response);
    });
    request.on('error', function(error) {
      console.log(error);
    });
    request.end();
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  cleanupMessage(message) {
    if (this.bot.config.deleteMessages){
      if (message.channel instanceof Discord.TextChannel) message.delete();
    }
  }

  isManager(member) {
  	if (member.roles.find("name", this.bot.permissions.manager_role)) return true;
  	return false;
  }

  isAdmin(member) {
    if (this.isManager(member)) return true;
  	if (member.roles.find("name", this.bot.permissions.admin_role)) return true;
  	return false;
  }

  sendMusicList(message, tag) {
    if (tag == null){
      const charlimit = 2000;
      var Output = "**Songs:**\n```\n";
      for (var key in this.musicData){
        if (this.musicData.hasOwnProperty(key)) {
          var nextsong = this.musicData[key];
          if (nextsong.name.length + Output.length >= charlimit){
            message.author.send(Output);
            Output = nextsong.name;
          }else{
            Output = Output + nextsong.name + "\n";
          }
        }
      }
      Output = Output + "```";
      message.author.send(Output);
    }else{
        //TODO: Tag Lookup
    }
  }

  sendSoundList(message, tag) {
    if (tag == null){
      const charlimit = 2000;
      var Output = "**Sounds:**\n```\n";
      for (var key in this.soundData){
        if (this.soundData.hasOwnProperty(key)) {
          var nextsound = this.soundData[key];
          if (nextsound.name.length + Output.length >= charlimit){
            message.author.send(Output);
            Output = nextsound.name;
          }else{
            Output = Output + nextsound.name + "\n";
          }
        }
      }
      Output = Output + "```";
      message.author.send(Output);
    }else{
        //TODO: Tag Lookup
    }
  }

  playSound(voiceChannel, filepath) {
    if (voiceChannel.guild.voiceConnection) return;
    if (!voiceChannel.joinable || !voiceChannel.speakable || voiceChannel.full) return;
    if (voiceChannel == null || filepath == null) return;
    voiceChannel.join().then((connection) => {
      const dispatcher = connection.playFile(filepath);
      connection.on('error', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        voiceChannel.leave();
      });
      connection.on('failed', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        voiceChannel.leave();
      });
      dispatcher.on('end', () => {
        connection.disconnect();
      });
    }).catch((error) => {
      voiceChannel.leave();
      this.logger("An error occured in sound playback:");
      console.log(error);
    })
  }

  playStream(voiceChannel, url) {
    if (voiceChannel == null || url == null) return;
    voiceChannel.join().then((connection) => {
  		const stream = ytdl(url, {filter: 'audioonly'});
  		const dispatcher = connection.playStream(stream, this.bot.basic.stream_options);
      connection.on('error', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        voiceChannel.leave();
      });
      connection.on('failed', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        voiceChannel.leave();
      });
  		dispatcher.on('end', () => {
        connection.disconnect();
      });
  	}).catch((err) => {
      voiceChannel.leave();
      this.logger("An error occured in stream playback:");
      console.log(err);
    });
  }

  setDefaultConfig() {
    var json_data = {"token": "YOUR_DISCORD_BOT_TOKEN", "chatbot_key": "YOUR_API.AI_AGENT_KEY", "bot_game": "by PacketCloud™", "bot_game_link": "", "deleteMessages": true};
    fs.writeFile("./config/config.json", JSON.stringify(json_data, null, 4), function(err){
      if (err) console.log(err);
    });
  }

  setDefaultPermissions() {
    var json_data = {"manager_role": "", "admin_role": "", "default_role": ""};
    fs.writeFile("./config/permissions.json", JSON.stringify(json_data, null, 4), function(err){
      if (err) console.log(err);
    });
  }

  startupIntegrityCheck() {
    if (!this.bot.config.hasOwnProperty("token") || typeof this.bot.config.token !== 'string'){
      this.setDefaultConfig();
      return;
    }
    if (!this.bot.config.hasOwnProperty("chatbot_key") || typeof this.bot.config.chatbot_key !== 'string'){
      this.setDefaultConfig();
      return;
    }
    if (!this.bot.config.hasOwnProperty("bot_game") || typeof this.bot.config.bot_game !== 'string'){
      this.setDefaultConfig();
      return;
    }
    if (!this.bot.config.hasOwnProperty("bot_game_link") || typeof this.bot.config.bot_game_link !== 'string'){
      this.setDefaultConfig();
      return;
    }
    if (!this.bot.config.hasOwnProperty("deleteMessages") || typeof this.bot.config.deleteMessages !== 'boolean'){
      this.setDefaultConfig();
      return;
    }
    if (!this.bot.permissions.hasOwnProperty("manager_role") || typeof this.bot.permissions.manager_role !== 'string'){
      this.setDefaultPermissions();
      return;
    }
    if (!this.bot.permissions.hasOwnProperty("admin_role") || typeof this.bot.permissions.admin_role !== 'string'){
      this.setDefaultPermissions();
      return;
    }
    if (!this.bot.permissions.hasOwnProperty("default_role") || typeof this.bot.permissions.default_role !== 'string'){
      this.setDefaultPermissions();
      return;
    }
    if (this.bot.config.token == "" || this.bot.config.token == "YOUR_DISCORD_BOT_TOKEN"){
      console.log("\n>>>>>>>>>> Discord bot token not configured. Please configure your token in './config/config.json'. See README for more information.\n");
      setTimeout(function(){
        throw new Error("Discord bot token not configured.");
      }, 500);
      return;
    }
    if (this.bot.config.chatbot_key == "" || this.bot.config.chatbot_key == "YOUR_API.AI_AGENT_KEY"){
      console.log("\n>>>>>>>>>> API.AI agent token not configured. Please configure your token in './config/config.json'. See README for more information.\n");
      setTimeout(function(){
        throw new Error("API.AI agent token not configured.");
      }, 500);
      return;
    }
    if (this.bot.permissions.manager_role == ""){
      console.log("\n>>>>>>>>>> Manager role not configured. Please configure bot-permission roles in './config/permissions.json'. See README for more information.\n");
      setTimeout(function(){
        throw new Error("Manager role not configured.");
      }, 500);
      return;
    }
    if (this.bot.permissions.admin_role == ""){
      console.log("\n>>>>>>>>>> Admin role not configured. Please configure bot-permission roles in './config/permissions.json'. See README for more information.\n");
      setTimeout(function(){
        throw new Error("Admin role not configured.");
      }, 500);
      return;
    }
  }

  throwConfigError() {
    console.log("\n>>>>>>>>>> There was a problem with your configuration file. It has been reset to default values. Please re-configure it in './config/config.json'. See README for more information.\n");
    setTimeout(function(){
      throw new Error("Problem with configuration file.");
    }, 500);
  }

  throwPermissionsError() {
    console.log("\n>>>>>>>>>> There was a problem with your permissions file. It has been reset to default values. Please re-configure it in './config/permissions.json'. See README for more information.\n");
    setTimeout(function(){
      throw new Error("Problem with permissions file.");
    }, 500);
  }

  getAudioData(json_file, sound_name) {
    return json_file.sound_name;
  }

  setAudioData(json_data, file, sound_obj) {
    json_data[sound_obj.name] = sound_obj;
    json_data = this.alphabetizeByKey(json_data);
    fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
      console.log(err);
    });
  }

  alphabetizeByKey(object) {
    var newObject = {};
    var keys = Object.keys(object);
    var len = keys.length;

    keys.sort();

    for (var i = 0; i < len; i++) {
      var k = keys[i];
      newObject[k] = object[k];
    }
    return newObject;
  }

  setUserSound(id, username, sound) {
    if (sound == null){
      delete this.bot.userSounds[id];
    }else if (this.soundData[sound]){
      this.bot.userSounds[id] = {"id": id, "username":username ,"sound": sound};
    }else{
      return false;
    }
    fs.writeFile("./userSounds.json", JSON.stringify(this.bot.userSounds, null, 4), function(err){
      return;
    });
    return true;
  }

  sendUserSounds(message) {
    var obj_keys = Object.keys(this.bot.userSounds);
    var usersounds = this.bot.userSounds;
    var sound_list = "**__User Sounds__:**\n```\n"
    for (var i in obj_keys){
      var user_id = obj_keys[i];
      sound_list = sound_list + usersounds[user_id].username + " (" + user_id + "):\nSound: " + usersounds[user_id].sound + "\n\n";
    }
    sound_list = sound_list + "```";
    message.author.send(sound_list);
  }
}

module.exports = Util;
