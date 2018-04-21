const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

const YouTube = require('./Services/YouTube.js');
const Util = require('./Util.js');
const R6Siege = require('./Services/R6Siege.js');
const WeatherUnderground = require('./Services/WeatherUnderground.js');

var command_prefix = "";

class CommandExecuter {
  constructor(bot) {
    this.bot = bot;
    this.util = bot.util;
    this.youTube = new YouTube(this.bot);
    this.r6Siege = new R6Siege(this.bot);
    this.weatherUnderground = new WeatherUnderground(this.bot);
    command_prefix = this.bot.basic.command_prefix;
  }

  aboutCommand(message) {
    message.reply("", {embed: this.util.generateAboutEmbed()});
    this.util.logStandardCommand(message, "about");
    this.util.cleanupMessage(message);
  }

  addsongCommand(message, body) {
    var force = false;
    var args = body.split(" ");
    var arg1 = args[0];
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (message.attachments.size <= 0){
      message.author.send("It appears you have not attached any audio file(s) to your command message.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1){
      if (arg1.toLowerCase() == "force"){
        force = true;
      }
    }
    this.util.addSongs(message, force, args);
    this.util.logStandardCommand(message, "addsong");
    this.bot.messageCleanupQueue.add(message, 0.15, true);
  }

  addsoundCommand(message, body) {
    var force = false;
    var args = body.split(" ");
    var arg1 = args[0];
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (message.attachments.size <= 0){
      message.author.send("It appears you have not attached any audio file(s) to your command message.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1){
      if (arg1.toLowerCase() == "force"){
        force = true;
      }
    }
    this.util.addSounds(message, force, args);
    this.util.logStandardCommand(message, "addsound");
    this.bot.messageCleanupQueue.add(message, 0.15, true);
  }

  consoleCommand(message, body, keep_messages) {
    if (!keep_messages) this.util.cleanupMessage(message);
    if (!this.util.isAdmin(message.member)){
      message.author.send("You do not have permission to use that command.");
      return;
    }
    var sudo = false;
    if (this.util.isManager(message.member)) sudo = true;
    this.util.logger("Console input from " + message.author.username + ":");
    this.bot.consoleHandler.handle(body, message, sudo);
  }

  helpCommand(message) {
    var discord_bot = this.bot;
    var embed;
    if (message.channel instanceof Discord.TextChannel){
      embed = this.util.generateHelpEmbed(this.util.isAdmin(message.member), this.util.isManager(message.member));
    }else{
      embed = this.util.generateHelpEmbed(false, false);
    }
    message.author.send("", {embed: embed});
    this.util.logStandardCommand(message, "help");
    this.util.cleanupMessage(message);
  }

  pauseCommand(message) {
    if (message.guild.voiceConnection && message.member.voiceChannel){
      if (message.guild.voiceConnection.channel.id == message.member.voiceChannelID){
        if (!this.bot.basic.dispatchers[message.guild.id].paused){
          this.bot.util.pauseDispatcher(message.guild.id);
          this.util.logStandardCommand(message, "play");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playCommand(message, arg1, body) {
    var query = body.replace(this.bot.basic.command_prefix, "").replace("play", "");
    if (message.member.voiceChannel == null){
      message.author.send("You need to be in a voice channel for me to play media.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.member.voiceChannel.joinable){
      message.author.send("I am not allowed to join that channel to play media.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!message.guild.voiceConnection){
      if (arg1){
        if (this.youTube.validateURL(arg1)){
          this.youTube.startStreamWithEmbed(message, message.member.voiceChannel, arg1);
        }else{
          this.bot.responseHandler.music.pm.startStreamFromSearch(message, query, this.bot.basic.stream_options);
        }
        this.util.logStandardCommand(message, "play");
      }
    }else{
      this.resumeCommand(message);
      return;
    }
    this.util.cleanupMessage(message);
  }

  playmusicCommand(message, arg1, arg2, body) {
    if (arg1 === "?"){
      var sort = null;
      var sortIndex = body.toLowerCase().search(/sort:[A-Za-z]+/);
      if (sortIndex >= 0) {
        sort = body.substring(sortIndex + "sort:".length).split(" ")[0];
        body = body.replace(/sort:[A-Za-z0-9]*/g, "").replace(/ {2,}/g, " ").trim();
        arg2 = body.split(" ")[1];
      }
      if (arg2){
        if (arg2.startsWith("-")){
          var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          this.util.sendMusicList(message, search_tags, false, false, sort);
        }else{
          if (arg2.startsWith("+")){
            var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          }else{
            var search_tags = body.substring(body.indexOf(" ") + 1).split(" ");
          }
          this.util.sendMusicList(message, search_tags, true, false, sort);
        }
      }else{
        this.util.sendMusicList(message, null, null, null, sort);
      }
      this.util.logStandardCommand(message, "playmusic");
      this.util.cleanupMessage(message);
      return;
    }
    if (!(message.channel instanceof Discord.TextChannel)){
      message.reply("You cannot perform a **" + command_prefix + "playmusic** command with those arguments from within a Direct Message. **" + command_prefix + "playmusic ?** is allowed.");
      return;
    }
    var channel = message.member.voiceChannel;
    var path = this.bot.basic.music_path;
    if (message.member.voiceChannel == null){
      message.author.send("You need to be in a voice channel for me to play music.");
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
        var obj_keys = Object.keys(this.bot.basic.musicData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.bot.basic.musicData[random_key].file);
        this.util.logStandardCommand(message, "playmusic");
      }else if (arg1.startsWith("+")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.bot.basic.musicData, tags, true, false);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no songs matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file);
          this.util.logStandardCommand(message, "playmusic");
        }
      }else if (arg1.startsWith("-")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.bot.basic.musicData, tags, false, false);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no songs matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file);
          this.util.logStandardCommand(message, "playmusic");
        }
      }else{
        var tags = body.split(" ");
        var collection = this.util.createMediaSubCollection(this.bot.basic.musicData, tags, true, true);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no songs matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file);
          this.util.logStandardCommand(message, "playmusic");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playsoundCommand(message, arg1, arg2, body) {
    var stream_options = {};
    if (arg1 === "?"){
      var sort = null;
      var sortIndex = body.toLowerCase().search(/sort:[A-Za-z]+/);
      if (sortIndex >= 0) {
        sort = body.substring(sortIndex + "sort:".length).split(" ")[0];
        body = body.replace(/sort:[A-Za-z0-9]*/g, "").replace(/ {2,}/g, " ").trim();
        arg2 = body.split(" ")[1];
      }
      if (arg2){
        if (arg2.startsWith("-")){
          var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          this.util.sendSoundList(message, search_tags, false, false, sort);
        }else{
          if (arg2.startsWith("+")){
            var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          }else{
            var search_tags = body.substring(body.indexOf(" ") + 1).split(" ");
          }
          this.util.sendSoundList(message, search_tags, true, false, sort);
        }
      }else{
        this.util.sendSoundList(message, null, null, null, sort);
      }
      this.util.logStandardCommand(message, "playsound");
      this.util.cleanupMessage(message);
      return;
    }
    if (!(message.channel instanceof Discord.TextChannel)){
      message.reply("You cannot perform a **" + command_prefix + "playsound** command with those arguments from within a Direct Message. **" + command_prefix + "playsound ?** is allowed.");
      return;
    }
    var channel = message.member.voiceChannel;
    var path = this.bot.basic.sound_path;
    if (message.member.voiceChannel == null){
      message.author.send("You need to be in a voice channel for me to play sounds.");
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
        var obj_keys = Object.keys(this.bot.basic.soundData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.bot.basic.soundData[random_key].file, stream_options);
        this.util.logStandardCommand(message, "playsound");
      }else if (arg1.startsWith("+")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.bot.basic.soundData, tags, true, false);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no sounds matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file, stream_options);
          this.util.logStandardCommand(message, "playsound");
        }
      }else if (arg1.startsWith("-")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.bot.basic.soundData, tags, false, false);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no sounds matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file, stream_options);
          this.util.logStandardCommand(message, "playsound");
        }
      }else{
        var tags = body.split(" ");
        var collection = this.util.createMediaSubCollection(this.bot.basic.soundData, tags, true, true);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no sounds matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file, stream_options);
          this.util.logStandardCommand(message, "playsound");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  purgemusicCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == "DELETE"){
      this.bot.basic.musicData = {};
      var file = this.bot.basic.music_path + "/_music.json";
      fs.writeFile(file, JSON.stringify(this.bot.basic.musicData, null, 4), function(err){
        return;
      });
      this.util.logStandardCommand(message, "purgemusic");
      this.util.cleanupMessage(message);
    }else{
      message.author.send("Are you sure you want to do this? The entire music library structure will be deleted but the files will remain on disk.\nIf you know what you are doing, run **!purgemusic DELETE** to confirm.");
      this.util.cleanupMessage(message);
    }
  }

  purgesoundsCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == "DELETE"){
      this.bot.basic.soundData = {};
      var file = this.bot.basic.sound_path + "/_sounds.json";
      fs.writeFile(file, JSON.stringify(this.bot.basic.soundData, null, 4), function(err){
        return;
      });
      this.util.logStandardCommand(message, "purgesounds");
      this.util.cleanupMessage(message);
    }else{
      message.author.send("Are you sure you want to do this? The entire sound library structure will be deleted but the files will remain on disk.\nIf you know what you are doing, run **!purgesounds DELETE** to confirm.");
      this.util.cleanupMessage(message);
    }
  }

  removesongCommand(message, arg1) {
    var discord_bot = this.bot;
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = this.bot.basic.musicData;
    var song = json_data[arg1];
    if (song){
      var filename = song.file;
      fs.unlink(this.bot.basic.music_path + "/" + filename, function(){});
      delete json_data[arg1];
      var file = this.bot.basic.music_path + "/_music.json";
      fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
        return;
      });
      this.bot.basic.musicData = require("." + this.bot.basic.music_path + "/_music.json");
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" + song.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" + song.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.addField(song.name, "File: " + song.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + song.uploaded + "\nUploader: " + song.uploader_username);
      message.reply("Song removed:", {embed: embed})
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      this.util.logStandardCommand(message, "removesong");
    }else{
      message.author.send("The song '" + arg1 + "' does not exist.");
    }
    this.util.cleanupMessage(message);
  }

  removesoundCommand(message, arg1) {
    var discord_bot = this.bot;
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.logStandardCommand(message, "removesound");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = this.bot.basic.soundData;
    var sound = json_data[arg1];
    if (sound){
      var filename = sound.file;
      fs.unlink(this.bot.basic.sound_path + "/" + filename, function(){});
      delete json_data[arg1];
      var file = this.bot.basic.sound_path + "/_sounds.json";
      fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
        return;
      });
      this.bot.basic.soundData = require("." + this.bot.basic.sound_path + "/_sounds.json");
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" + sound.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" + sound.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.addField(sound.name, "File: " + sound.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + sound.uploaded + "\nUploader: " + sound.uploader_username);
      message.reply("Sound removed:", {embed: embed})
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      this.util.logStandardCommand(message, "removesound");
    }else{
      message.author.send("The sound '" + arg1 + "' does not exist.");
    }
    this.util.cleanupMessage(message);
  }

  resumeCommand(message) {
    if (message.guild.voiceConnection && message.member.voiceChannel){
      if (message.guild.voiceConnection.channel.id == message.member.voiceChannelID){
        if (this.bot.basic.dispatchers[message.guild.id].paused){
          this.bot.util.resumeDispatcher(message.guild.id);
          this.util.logStandardCommand(message, "resume");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  sayCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    message.channel.send(message.content.replace(this.bot.basic.command_prefix + "say ", ""));
    this.util.logStandardCommand(message, "say");
    this.util.cleanupMessage(message);
  }

  setbotactivityCommand(message, arg1, arg2, arg3){
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!arg1){
      if (this.bot.config.bot_activity_url) this.bot.user.setActivity(this.bot.config.bot_activity, {"url": this.bot.config.bot_activity_URL, "type": this.bot.config.bot_activity_type});
      else this.bot.user.setActivity(this.bot.config.bot_activity);
    }else{
      if (arg2){
          if (arg2 == "playing" || arg2 == "watching" || arg2 == "listening"){
            this.bot.user.setActivity(arg1.replace(/_/g," "), {"type": arg2});
          }else if (arg2 == "streaming"){
            this.bot.user.setActivity(arg1.replace(/_/g," "), {"type": arg2, "url": arg3});
          }else{
            this.bot.user.setActivity(arg1.replace(/_/g," "), {"type": "streaming", "url": arg2});
          }
      }
      else this.bot.user.setActivity(arg1.replace(/_/g," "));
    }
    this.util.logStandardCommand(message, "setbotactivity");
    this.util.cleanupMessage(message);
  }

  setbotavatarCommand(message){
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    this.bot.user.setAvatar("./assets/avatar.png");
    this.util.logStandardCommand(message, "setbotavatar");
    this.util.cleanupMessage(message);
  }

  setbotstatusCommand(message, arg1){
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1){
      this.bot.user.setPresence({status:arg1});
    }else{
      this.bot.user.setPresence({status:"online"});
    }
    this.util.logStandardCommand(message, "setbotstatus");
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

  songinfoCommand(message, body) {
    var args = body.split(" ");
    var arg1 = args[0];
    args = args.slice(1);
    var song = this.util.getSongInfo(arg1.toLowerCase());
    if (song) {
      if (this.util.isAdmin(message.member)){
        song = this.util.modifyAudioData(song, args);
        this.util.updateAudioData("music", song);
      }
      var discord_bot = this.bot;
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" +song.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" +song.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.addField(song.name, "File: " + song.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + song.uploaded + "\nUploader: " + song.uploader_username);
      message.reply("", {embed: embed})
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      this.util.logStandardCommand(message, "songinfo");
    }else{
      message.author.send("I could not find the song '" + arg1 + "' in my local library.");
    }
    this.util.cleanupMessage(message);
  }

  soundinfoCommand(message, body) {
    var args = body.split(" ");
    var arg1 = args[0];
    args = args.slice(1);
    var sound = this.util.getSoundInfo(arg1.toLowerCase());
    if (sound) {
      if (this.util.isAdmin(message.member)){
        sound = this.util.modifyAudioData(sound, args);
        this.util.updateAudioData("sounds", sound);
      }
      var discord_bot = this.bot;
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" + sound.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" +sound.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.addField(sound.name, "File: " + sound.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + sound.uploaded + "\nUploader: " + sound.uploader_username);
      message.reply("", {embed: embed})
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      this.util.logStandardCommand(message, "soundinfo");
    }else{
      message.author.send("I could not find the sound '" + arg1 + "' in my local library.");
    }
    this.util.cleanupMessage(message);
  }

  stopCommand(message) {
    if (message.guild.voiceConnection){
      if (message.member.voiceChannel){
        if (message.guild.voiceConnection.channel.id == message.member.voiceChannel.id){
          this.util.endDispatcher(message.guild.id);
          this.util.logStandardCommand(message, "stop");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  updatemusicCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    var discord_bot = this.bot;
    var addedSongs = [];
    var removedSongs = [];
    var file_list = fs.readdirSync(this.bot.basic.music_path);
    for (var i in file_list){
      var sound = file_list[i];
      var ext = sound.split(".");
      ext = ext[ext.length - 1];
      var name = sound.slice(0, -ext.length - 1).toLowerCase();
      if (!this.bot.basic.musicData.hasOwnProperty(name)){
        if (ext != "json"){
          var currentDate = new Date();
          var newSongObject = {"name": name, "file": sound, "extension": ext, "artists": [], "tags": [], "uploaded": currentDate.toJSON(), "modified": currentDate.toJSON(), "uploader": message.author.id, "uploader_username": message.author.username};
          this.bot.basic.musicData[name] = newSongObject;
          addedSongs.push(newSongObject);
        }
      }
    }
    for (var i in this.bot.basic.musicData){
      var sound = this.bot.basic.musicData[i];
      if (!file_list.includes(sound.file)){
        removedSongs.push(sound);
        delete this.bot.basic.musicData[i];
      }
    }
    if (addedSongs.length){
      for (var i in addedSongs){
        var song_obj = addedSongs[i];
        var artists = "-";
        var tags = "-";
        if (artists.length) artists = "\"" + song_obj.artists.join("\", \"") + "\"";
        if (tags.length) tags = "\"" +song_obj.tags.join("\", \"") + "\"";
        var embed = new Discord.RichEmbed();
        embed.setColor(parseInt(discord_bot.colours.bot_embed_colour));
        embed.addField(song_obj.name, "File: " + song_obj.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + song_obj.uploaded + "\nUploader: " + song_obj.uploader_username);
        message.reply("Song added:", {embed: embed})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }
    if (removedSongs.length){
      for (var i in removedSongs){
        var song_obj = removedSongs[i];
        var artists = "-";
        var tags = "-";
        if (artists.length) artists = "\"" + song_obj.artists.join("\", \"") + "\"";
        if (tags.length) tags = "\"" +song_obj.tags.join("\", \"") + "\"";
        var embed = new Discord.RichEmbed();
        embed.setColor(parseInt(discord_bot.colours.bot_embed_colour));
        embed.addField(song_obj.name, "File: " + song_obj.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + song_obj.uploaded + "\nUploader: " + song_obj.uploader_username);
        message.reply("Song removed:", {embed: embed})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }
    this.bot.basic.musicData = this.util.sortByProperty(this.bot.basic.musicData, "name");
    var file = this.bot.basic.music_path + "/_music.json";
    fs.writeFile(file, JSON.stringify(this.bot.basic.musicData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "updatemusic");
    this.util.cleanupMessage(message);
  }

  updatesoundsCommand(message) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    var discord_bot = this.bot;
    var addedSounds = [];
    var removedSounds = [];
    var file_list = fs.readdirSync(this.bot.basic.sound_path);
    for (var i in file_list){
      var sound = file_list[i];
      var ext = sound.split(".");
      ext = ext[ext.length - 1];
      var name = sound.slice(0, -ext.length - 1).toLowerCase();
      if (!this.bot.basic.soundData.hasOwnProperty(name)){
        if (ext != "json"){
          var currentDate = new Date();
          var newSoundObject = {"name": name, "file": sound, "extension": ext, "artists": [], "tags": [], "uploaded": currentDate.toJSON(), "modified": currentDate.toJSON(), "uploader": message.author.id, "uploader_username": message.author.username};
          this.bot.basic.soundData[name] = newSoundObject;
          addedSounds.push(newSoundObject);
        }
      }
    }
    for (var i in this.bot.basic.soundData){
      var sound = this.bot.basic.soundData[i];
      if (!file_list.includes(sound.file)){
        removedSounds.push(sound);
        delete this.bot.basic.soundData[i];
      }
    }
    if (addedSounds.length){
      for (var i in addedSounds){
        var sound_obj = addedSounds[i];
        var artists = "-";
        var tags = "-";
        if (artists.length) artists = "\"" + sound_obj.artists.join("\", \"") + "\"";
        if (tags.length) tags = "\"" +sound_obj.tags.join("\", \"") + "\"";
        var embed = new Discord.RichEmbed();
        embed.setColor(parseInt(discord_bot.colours.bot_embed_colour));
        embed.addField(sound_obj.name, "File: " + sound_obj.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + sound_obj.uploaded + "\nUploader: " + sound_obj.uploader_username);
        message.reply("Sound added:", {embed: embed})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }
    if (removedSounds.length){
      for (var i in removedSounds){
        var sound_obj = removedSounds[i];
        var artists = "-";
        var tags = "-";
        if (artists.length) artists = "\"" + sound_obj.artists.join("\", \"") + "\"";
        if (tags.length) tags = "\"" +sound_obj.tags.join("\", \"") + "\"";
        var embed = new Discord.RichEmbed();
        embed.setColor(parseInt(discord_bot.colours.bot_embed_colour));
        embed.addField(sound_obj.name, "File: " + sound_obj.file + "\nArtists: " + artists + "\nTags: " + tags + "\nUploaded: " + sound_obj.uploaded + "\nUploader: " + sound_obj.uploader_username);
        message.reply("Sound removed:", {embed: embed})
        .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      }
    }
    this.bot.basic.soundData = this.util.sortByProperty(this.bot.basic.soundData, "name");
    var file = this.bot.basic.sound_path + "/_sounds.json";
    fs.writeFile(file, JSON.stringify(this.bot.basic.soundData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "updatesounds");
    this.util.cleanupMessage(message);
  }

  ytdlCommand(message, arg1) {
    if (arg1){
      if (this.youTube.validateURL(arg1)){
        this.youTube.getVideoMP3DownloadURL(message, arg1);
        this.util.logStandardCommand(message, "ytdl");
      }else{
        message.author.send("That does not appear to be a valid YouTube video URL.");
      }
    }else{
      message.author.send("That does not appear to be a valid YouTube video URL.");
    }
    this.util.cleanupMessage(message);
  }
}

module.exports = CommandExecuter;
