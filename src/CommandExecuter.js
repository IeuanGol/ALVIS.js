const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const Util = require('./Util.js');

class CommandExecuter {
  constructor(bot) {
    this.bot = bot;
    this.util = new Util(bot);
  }
  
  addallmusicCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    this.util.musicData = {};
    var file_list = fs.readdirSync(this.bot.basic.music_path);
    for (var i in file_list){
      var sound = file_list[i];
      var ext = sound.split(".");
      ext = ext[ext.length - 1];
      var name = sound.split(".")[0];
      if (ext != "json"){
        this.util.musicData[name] = {"name": name, "file": sound};
      }
    }
    var file = this.bot.basic.music_path + "/music.json";
    fs.writeFile(file, JSON.stringify(this.util.musicData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "addallmusic");
    this.util.cleanupMessage(message);
  }

  addallsoundsCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    this.util.soundData = {};
    var file_list = fs.readdirSync(this.bot.basic.sound_path);
    for (var i in file_list){
      var sound = file_list[i];
      var ext = sound.split(".");
      ext = ext[ext.length - 1];
      var name = sound.split(".")[0];
      if (ext != "json"){
        this.util.soundData[name] = {"name": name, "file": sound};
      }
    }
    var file = this.bot.basic.sound_path + "/sounds.json";
    fs.writeFile(file, JSON.stringify(this.util.soundData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "addallsounds");
    this.util.cleanupMessage(message);
  }

  addmusicCommand(message, arg1, arg2) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == null || arg2 == null){
      message.author.send("**Invalid Command**");
      message.author.send("Missing argument(s)");
      this.util.cleanupMessage(message);
      return;
    }
    if (!fs.existsSync(this.bot.basic.music_path + "/" + arg2)){
      message.author.send("**Invalid Command**");
      message.author.send("File '" + arg2 + "' does not exist.");
      this.util.cleanupMessage(message);
      return;
    }
    const sound_obj = {"name": arg1, "file": arg2};
    this.util.setAudioData(this.util.musicData, this.bot.basic.music_path + "/music.json", sound_obj);
    this.util.musicData = require("." + this.bot.basic.music_path + "/music.json");
    this.util.logStandardCommand(message, "addmusic");
    this.util.cleanupMessage(message);
  }

  addsoundCommand(message, arg1, arg2) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == null || arg2 == null){
      message.author.send("**Invalid Command**");
      message.author.send("Missing argument(s)");
      this.util.cleanupMessage(message);
      return;
    }
    if (!fs.existsSync(this.bot.basic.sound_path + "/" + arg2)){
      message.author.send("**Invalid Command**");
      message.author.send("File '" + arg2 + "' does not exist.");
      this.util.cleanupMessage(message);
      return;
    }
    const sound_obj = {"name": arg1, "file": arg2};
    this.util.setAudioData(this.util.soundData, this.bot.basic.sound_path + "/sounds.json",sound_obj);
    this.util.soundData = require("." + this.bot.basic.sound_path + "/sounds.json");
    this.util.logStandardCommand(message, "addsound");
    this.util.cleanupMessage(message);
  }

  aboutCommand(message) {
    message.reply(this.bot.responses.about_response + this.bot.basic.version);
    this.util.logStandardCommand(message, "about");
    this.util.cleanupMessage(message);
  }

  flipCommand(message) {
    const outcome = ["heads", "tails"];
    message.reply("You flipped " + outcome[this.util.getRandomInt(0, 1)] + ".");
    this.util.logStandardCommand(message, "flip");
    this.util.cleanupMessage(message);
  }

  helpCommand(message) {
    message.reply(this.bot.responses.cmdList);
    this.util.logStandardCommand(message, "help");
    this.util.cleanupMessage(message);
  }

  playmusicCommand(message, arg1, arg2) {
    const channel = message.member.voiceChannel;
    const path = this.bot.basic.music_path;
    if (arg1 === "?"){
      this.util.sendMusicList(message, null);
      if (message.channel instanceof Discord.TextChannel) {
        this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playmusic ?' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
      }else {
        this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playmusic ?' command from " + message.author.username);
      }
      this.util.cleanupMessage(message);
      return;
    }
    if (message.member.voiceChannel == null){
      message.author.send("**Invalid Command**");
      message.author.send("You must be in a voice channel to play music.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!channel.joinable){
      message.author.send("**Blocked Command**");
      message.author.send("I do not have permission to join that channel.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.guild.voiceConnection){
      if (arg1 == null){
        var obj_keys = Object.keys(this.util.musicData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.util.musicData[random_key].file);
        if (message.channel instanceof Discord.TextChannel) {
          this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playmusic' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
        }else {
          this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playmusic' command from " + message.author.username);
        }
      }else{
        if (this.util.musicData[arg1] == null){
          message.author.send("**Invalid Command**");
          message.author.send("Song '" + arg1 + "' does not exist.");
        }else{
          this.util.playSound(channel, path + "/" + this.util.musicData[arg1].file);
          if (message.channel instanceof Discord.TextChannel) {
            this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playmusic " + arg1 + "' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
          }else{
            this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playmusic " + arg1 +"' command from " + message.author.username);
          }
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playsoundCommand(message, arg1, arg2) {
    const channel = message.member.voiceChannel;
    const path = this.bot.basic.sound_path;
    if (arg1 === "?"){
      this.util.sendSoundList(message, null);
      if (message.channel instanceof Discord.TextChannel) {
        this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playsound ?' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
      }else {
        this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playsound ?' command from " + message.author.username);
      }
      this.util.cleanupMessage(message);
      return;
    }
    if (message.member.voiceChannel == null){
      message.author.send("**Invalid Command**");
      message.author.send("You must be in a voice channel to play sounds.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!channel.joinable){
      message.author.send("**Blocked Command**");
      message.author.send("I do not have permission to join that channel.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.guild.voiceConnection){
      if (arg1 == null){
        var obj_keys = Object.keys(this.util.soundData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.util.soundData[random_key].file);
        if (message.channel instanceof Discord.TextChannel) {
          this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playsound' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
        }else {
          this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playsound' command from " + message.author.username);
        }
      }else{
        if (this.util.soundData[arg1] == null){
          message.author.send("**Invalid Command**");
          message.author.send("Sound '" + arg1 + "' does not exist.");
        }else{
          this.util.playSound(channel, path + "/" + this.util.soundData[arg1].file);
          if (message.channel instanceof Discord.TextChannel) {
            this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playsound " + arg1 + "' command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
          }else{
            this.util.logger("Responded to '" + this.bot.basic.command_prefix + "playsound " + arg1 +"' command from " + message.author.username);
          }
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playstreamCommand(message, arg1) {
    const channel = message.member.voiceChannel;
    if (channel == null){
      message.author.send("**Invalid Command**");
      message.author.send("You must be in a voice channel to play sounds.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!channel.joinable){
      message.author.send("**Blocked Command**");
      message.author.send("I do not have permission to join that channel.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.guild.voiceConnection){
      this.util.playStream(channel, arg1);
      this.util.logStandardCommand(message, "playstream");
    }
    this.util.cleanupMessage(message);
  }

  purgemusicCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = {};
    var file = this.bot.basic.music_path + "/music.json";
    fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
      return;
    });
    this.util.musicData = require("." + this.bot.basic.music_path + "/music.json");
    this.util.logStandardCommand(message, "purgemusic");
    this.util.cleanupMessage(message);
  }

  purgesoundsCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.logStandardCommand(message, "purgesounds");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = {};
    var file = this.bot.basic.sound_path + "/sounds.json";
    fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
      return;
    });
    this.util.soundData = require("." + this.bot.basic.sound_path + "/sounds.json");
    this.util.cleanupMessage(message);
  }

  removemusicCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.logStandardCommand(message, "removemusic");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = this.util.musicData;
    delete json_data[arg1];
    var file = this.bot.basic.music_path + "/music.json";
    fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
      return;
    });
    this.util.musicData = require("." + this.bot.basic.music_path + "/music.json");
    this.util.logStandardCommand(message, "purgemusic");
    this.util.cleanupMessage(message);
  }

  removesoundCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.logStandardCommand(message, "removesound");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = this.util.soundData;
    delete json_data[arg1];
    var file = this.bot.basic.sound_path + "/sounds.json";
    fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
      return;
    });
    this.util.soundData = require("." + this.bot.basic.sound_path + "/sounds.json");
    this.util.cleanupMessage(message);
  }

  rollCommand(message, arg1) {
    arg1 = parseInt(arg1);
    if (isNaN(arg1)){
      arg1 = 6;
    }else{
      arg1 = Math.round(arg1);
    }
    message.reply("You rolled a " + this.util.getRandomInt(1, arg1));
    this.util.logStandardCommand(message, "roll");
    this.util.cleanupMessage(message);
  }

  sayCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    message.channel.send(message.content.replace("!say ", ""));
    this.util.logStandardCommand(message, "say");
    this.util.cleanupMessage(message);
  }

  setusersoundCommand(message, arg1, arg2) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!arg1) {
      message.author.send("**Invalid Command**");
      message.author.send("Missing target user @mention.");
      this.util.cleanupMessage(message);
      return;
    }
    var id = arg1.replace("<@", "").replace("!", ""). replace(">", "");
    if (isNaN(id) || !(arg1.includes("<@") && arg1.includes(">"))){
      message.author.send("**Invalid Command**");
      message.author.send("First argument is not a proper @mention of target user.");
    }else if (this.util.setUserSound(id, arg2)){
      this.util.logStandardCommand(message, "setusersound");
    }else{
      message.author.send("**Invalid Command**");
      message.author.send("Sound '" + arg2 + "' does not exist.");
    }
    this.util.cleanupMessage(message);
  }

  showusersoundsCommand(message) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("**Blocked Command**");
      message.author.send("You do not have permission to use this command.");
      this.util.cleanupMessage(message);
      return;
    }
    message.author.send("**__User Sounds:__**");
    this.util.sendUserSounds(message);
    this.util.logStandardCommand(message,"showusersounds");
    this.util.cleanupMessage(message);
  }

  stopCommand(message) {
    if (message.guild.voiceConnection){
      message.guild.voiceConnection.disconnect();
    }else{
      message.author.send("**Invalid Command**");
      message.author.send("No sound currently playing on server.");
      this.util.cleanupMessage(message);
      return;
    }
    this.util.logStandardCommand(message, "stop");
    this.util.cleanupMessage(message);
  }
}

module.exports = CommandExecuter;
