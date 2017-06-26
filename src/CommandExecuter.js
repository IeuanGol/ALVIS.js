const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

const Util = require('./Util.js');
const R6Siege = require('./Services/R6Siege.js');

var command_prefix = "";

class CommandExecuter {
  constructor(bot) {
    this.bot = bot;
    this.util = new Util(bot);
    this.r6Siege = new R6Siege(this.bot);
    command_prefix = this.bot.basic.command_prefix;
  }

  addallmusicCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    var file_list = fs.readdirSync(this.bot.basic.music_path);
    for (var i in file_list){
      var sound = file_list[i];
      var ext = sound.split(".");
      ext = ext[ext.length - 1];
      var name = sound.slice(0, -ext.length - 1);
      if (!this.util.musicData.hasOwnProperty(name)){
        if (ext != "json"){
          this.util.musicData[name] = {"name": name, "file": sound, "extension": ext, "artists": [], "aliases": [], "tags": []};
        }
      }
    }
    this.util.musicData = this.util.alphabetizeByKey(this.util.musicData);
    var file = this.bot.basic.music_path + "/music.json";
    fs.writeFile(file, JSON.stringify(this.util.musicData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "addallmusic");
    this.util.cleanupMessage(message);
  }

  addallsoundsCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    var file_list = fs.readdirSync(this.bot.basic.sound_path);
    for (var i in file_list){
      var sound = file_list[i];
      var ext = sound.split(".");
      ext = ext[ext.length - 1];
      var name = sound.slice(0, -ext.length - 1);
      if (!this.util.soundData.hasOwnProperty(name)){
        if (ext != "json"){
          this.util.soundData[name] = {"name": name, "file": sound, "extension": ext, "artists": [], "aliases": [], "tags": []};
        }
      }
    }
    this.util.soundData = this.util.alphabetizeByKey(this.util.soundData);
    var file = this.bot.basic.sound_path + "/sounds.json";
    fs.writeFile(file, JSON.stringify(this.util.soundData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "addallsounds");
    this.util.cleanupMessage(message);
  }

  addmusicCommand(message, arg1, arg2) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == null || arg2 == null){
      message.author.send("It appears your command is missing some required argument(s).");
      this.util.cleanupMessage(message);
      return;
    }
    if (!fs.existsSync(this.bot.basic.music_path + "/" + arg2)){
      message.author.send("The file '" + arg2 + "' you specified does not exist.");
      this.util.cleanupMessage(message);
      return;
    }
    var ext = arg2.split(".");
    ext = ext[ext.length - 1];
    const sound_obj = {"name": name, "file": sound, "extension": ext, "artists": [], "aliases": [], "tags": []};
    this.util.setAudioData(this.util.musicData, this.bot.basic.music_path + "/music.json", sound_obj);
    this.util.musicData = require("." + this.bot.basic.music_path + "/music.json");
    this.util.logStandardCommand(message, "addmusic");
    this.util.cleanupMessage(message);
  }

  addsoundCommand(message, arg1, arg2) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == null || arg2 == null){
      message.author.send("It appears your command is missing some required argument(s).");
      this.util.cleanupMessage(message);
      return;
    }
    if (!fs.existsSync(this.bot.basic.sound_path + "/" + arg2)){
      message.author.send("The file '" + arg2 + "' you specified does not exist.");
      this.util.cleanupMessage(message);
      return;
    }
    var ext = arg2.split(".");
    ext = ext[ext.length - 1];
    const sound_obj = {"name": name, "file": sound, "extension": ext, "artists": [], "aliases": [], "tags": []};
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

  playmusicCommand(message, arg1, arg2, body) {
    if (arg1 === "?"){
      if (arg2){
        var search_tag = body.substring(body.indexOf(" ") + 1);
        this.util.sendMusicList(message, search_tag);
      }else{
        this.util.sendMusicList(message, null);
      }
      this.util.logStandardCommand(message, "playmusic");
      this.util.cleanupMessage(message);
      return;
    }
    if (!(message.channel instanceof Discord.TextChannel)){
      message.reply("You cannot perform a **" + command_prefix + "playmusic** command with those arugments from within a Direct Message. **" +command_prefix + "playmusic ?** is allowed.");
      return;
    }
    var channel = message.member.voiceChannel;
    var path = this.bot.basic.music_path;
    if (message.member.voiceChannel == null){
      message.author.send("You need to be in a voice channel for me to play your requested music.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!channel.joinable){
      message.author.send("I am not allowed to join that channel to play music.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.guild.voiceConnection){
      if (arg1 == null){
        var obj_keys = Object.keys(this.util.musicData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.util.musicData[random_key].file);
        this.util.logStandardCommand(message, "playmusic");
      }else{
        if (this.util.musicData[body] == null){
          message.author.send("The song '" + body + "' does not exist in my library. Use **!playmusic ?** for a list of songs.");
        }else{
          this.util.playSound(channel, path + "/" + this.util.musicData[body].file);
          this.util.logStandardCommand(message, "playmusic");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playsoundCommand(message, arg1, arg2, body) {
    var stream_options = {};
    if (arg1 === "?"){
      if (arg2){
        var search_tag = body.substring(body.indexOf(" ") + 1);
        this.util.sendSoundList(message, search_tag);
      }else{
        this.util.sendSoundList(message, null);
      }
      this.util.logStandardCommand(message, "playsound");
      this.util.cleanupMessage(message);
      return;
    }
    if (!(message.channel instanceof Discord.TextChannel)){
      message.reply("You cannot perform a **" + command_prefix + "playsound** command with those arugments from within a Direct Message. **" +command_prefix + "playsound ?** is allowed.");
      return;
    }
    var channel = message.member.voiceChannel;
    var path = this.bot.basic.sound_path;
    if (message.member.voiceChannel == null){
      message.author.send("You need to be in a voice channel for me to play your requested sound.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!channel.joinable){
      message.author.send("I am not allowed to join that channel to play sounds.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.guild.voiceConnection){
      if (arg1 == null){
        var obj_keys = Object.keys(this.util.soundData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.util.soundData[random_key].file, stream_options);
        this.util.logStandardCommand(message, "playsound");
      }else{
        if (this.util.soundData[body] == null){
          message.author.send("The sound '" + body + "' does not exist in my library. Use **!playsound ?** for a list of sounds.");
        }else{
          this.util.playSound(channel, path + "/" + this.util.soundData[body].file, stream_options);
          this.util.logStandardCommand(message, "playsound");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playstreamCommand(message, arg1) {
    const channel = message.member.voiceChannel;
    if (channel == null){
      message.author.send("You need to be in a voice channel for me to play your requested stream.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!channel.joinable){
      message.author.send("I am not allowed to join that channel to play sounds.");
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
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    this.util.musicData = {};
    var file = this.bot.basic.music_path + "/music.json";
    fs.writeFile(file, JSON.stringify(this.util.musicData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "purgemusic");
    this.util.cleanupMessage(message);
  }

  purgesoundsCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    this.util.soundData = {};
    var file = this.bot.basic.sound_path + "/sounds.json";
    fs.writeFile(file, JSON.stringify(this.util.soundData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "purgesounds");
    this.util.cleanupMessage(message);
  }

  r6statsCommand(message, arg1, arg2) {
    if (arg1 == null) {
      message.author.send("Please provide a username in your command for me to search up.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg2 == "xbox") arg2 = "xone";
    if (arg2 == "pc") arg2 = "uplay";
    if (arg2 && arg2 != "xone" && arg2 != "uplay" && arg2 != "ps4"){
      message.author.send("You provided an invalid platform argument in your command.\nValid platforms include: `pc`, or `uplay`; `xbox`, or `xone`; `ps4`. Leaving it blank will default to `pc`");
      this.util.cleanupMessage(message);
      return;
    }
    this.r6Siege.getStats(message, arg1, arg2);
    this.util.logStandardCommand(message, "r6stats");
    this.util.cleanupMessage(message);
  }

  removemusicCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
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
      message.author.send("You do not have permission to use that command.");
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
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    message.channel.send(message.content.replace("!say ", ""));
    this.util.logStandardCommand(message, "say");
    this.util.cleanupMessage(message);
  }

  setusersoundCommand(message, arg1, arg2) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!arg1) {
      message.author.send("Your command is missing an @mention of the target user.");
      this.util.cleanupMessage(message);
      return;
    }
    var user = message.mentions.users.first();
    var id = user.id;
    var username = user.username;
    if (isNaN(id) || !(arg1.includes("<@") && arg1.includes(">"))){
      message.author.send("The first argument of that command is not a proper @mention of target user.");
    }else if (this.util.setUserSound(id, username, arg2)){
      this.util.logStandardCommand(message, "setusersound");
    }else{
      message.author.send("The Sound '" + arg2 + "' requested in your command does not exist.");
    }
    this.util.cleanupMessage(message);
  }

  showusersoundsCommand(message) {
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    this.util.sendUserSounds(message);
    this.util.logStandardCommand(message,"showusersounds");
    this.util.cleanupMessage(message);
  }

  stopCommand(message) {
    if (message.guild.voiceConnection){
      if (message.member.voiceChannel){
        if (message.guild.voiceConnection.channel.id == message.member.voiceChannel.id){
          message.guild.voiceConnection.disconnect();
          this.util.logStandardCommand(message, "stop");
          this.util.cleanupMessage(message);
          return;
        }
      }
    }
    message.author.send("There is currently no audio for me to stop.");
    this.util.cleanupMessage(message);
  }
}

module.exports = CommandExecuter;
