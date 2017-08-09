const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

const Util = require('./Util.js');
const R6Siege = require('./Services/R6Siege.js');
const WeatherUnderground = require('./Services/WeatherUnderground.js');

var command_prefix = "";

class CommandExecuter {
  constructor(bot) {
    this.bot = bot;
    //this.util = new Util(bot);
    this.util = bot.util;
    this.r6Siege = new R6Siege(this.bot);
    this.weatherUnderground = new WeatherUnderground(this.bot);
    command_prefix = this.bot.basic.command_prefix;
  }

  aboutCommand(message) {
    message.reply("", {embed: this.util.generateAboutEmbed()});
    this.util.logStandardCommand(message, "about");
    this.util.cleanupMessage(message);
  }

  addsongCommand(message, arg1) {
    var force = false;
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
      if (arg1.toLowerCase() == "-f"){
        force = true;
      }
    }
    this.util.addSongs(message, force);
    this.util.logStandardCommand(message, "addsong");
    this.bot.messageCleanupQueue.add(message, 0.15, true);
  }

  addsoundCommand(message, arg1) {
    var force = false;
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
      if (arg1.toLowerCase() == "-f"){
        force = true;
      }
    }
    this.util.addSounds(message, force);
    this.util.logStandardCommand(message, "addsound");
    this.bot.messageCleanupQueue.add(message, 0.15, true);
  }

  flipCommand(message) {
    const outcome = ["heads", "tails"];
    message.reply("You flipped " + outcome[this.util.getRandomInt(0, 1)] + ".");
    this.util.logStandardCommand(message, "flip");
    this.util.cleanupMessage(message);
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

  importmusicCommand(message) {
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
      var name = sound.slice(0, -ext.length - 1).toLowerCase();
      if (!this.util.musicData.hasOwnProperty(name)){
        if (ext != "json"){
          this.util.musicData[name] = {"name": name, "file": sound, "extension": ext, "artists": [], "aliases": [], "tags": []};
        }
      }
    }
    this.util.musicData = this.util.alphabetizeByKey(this.util.musicData);
    var file = this.bot.basic.music_path + "/_music.json";
    fs.writeFile(file, JSON.stringify(this.util.musicData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "importmusic");
    this.util.cleanupMessage(message);
  }

  importsoundsCommand(message) {
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
      var name = sound.slice(0, -ext.length - 1).toLowerCase();
      if (!this.util.soundData.hasOwnProperty(name)){
        if (ext != "json"){
          this.util.soundData[name] = {"name": name, "file": sound, "extension": ext, "artists": [], "aliases": [], "tags": []};
        }
      }
    }
    this.util.soundData = this.util.alphabetizeByKey(this.util.soundData);
    var file = this.bot.basic.sound_path + "/_sounds.json";
    fs.writeFile(file, JSON.stringify(this.util.soundData, null, 4), function(err){
      return;
    });
    this.util.logStandardCommand(message, "importsounds");
    this.util.cleanupMessage(message);
  }

  playmusicCommand(message, arg1, arg2, body) {
    if (arg1 === "?"){
      if (arg2){
        if (arg2.startsWith("-")){
          var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          this.util.sendMusicList(message, search_tags, false, false);
        }else{
          if (arg2.startsWith("+")){
            var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          }else{
            var search_tags = body.substring(body.indexOf(" ") + 1).split(" ");
          }
          this.util.sendMusicList(message, search_tags, true, false);
        }
      }else{
        this.util.sendMusicList(message, null);
      }
      this.util.logStandardCommand(message, "playmusic");
      this.util.cleanupMessage(message);
      return;
    }
    if (!(message.channel instanceof Discord.TextChannel)){
      message.reply("You cannot perform a **" + command_prefix + "playmusic** command with those arugments from within a Direct Message. **" + command_prefix + "playmusic ?** is allowed.");
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
        var obj_keys = Object.keys(this.util.musicData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.util.musicData[random_key].file);
        this.util.logStandardCommand(message, "playmusic");
      }else if (arg1.startsWith("+")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.util.musicData, tags, true, false);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no songs matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file);
          this.util.logStandardCommand(message, "playsound");
        }
      }else if (arg1.startsWith("-")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.util.musicData, tags, false, false);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no songs matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file);
          this.util.logStandardCommand(message, "playsound");
        }
      }else{
        var tags = body.split(" ");
        var collection = this.util.createMediaSubCollection(this.util.musicData, tags, true, true);
        if (this.util.objectIsEmpty(collection)){
          message.author.send("There are no songs matching your query.");
        }else{
          var obj_keys = Object.keys(collection);
          var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
          this.util.playSound(channel, path + "/" + collection[random_key].file);
          this.util.logStandardCommand(message, "playsound");
        }
      }
    }
    this.util.cleanupMessage(message);
  }

  playsoundCommand(message, arg1, arg2, body) {
    var stream_options = {};
    if (arg1 === "?"){
      if (arg2){
        if (arg2.startsWith("-")){
          var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          this.util.sendSoundList(message, search_tags, false, false);
        }else{
          if (arg2.startsWith("+")){
            var search_tags = body.substring(body.indexOf(" ") + 2).split(" ");
          }else{
            var search_tags = body.substring(body.indexOf(" ") + 1).split(" ");
          }
          this.util.sendSoundList(message, search_tags, true, false);
        }
      }else{
        this.util.sendSoundList(message, null);
      }
      this.util.logStandardCommand(message, "playsound");
      this.util.cleanupMessage(message);
      return;
    }
    if (!(message.channel instanceof Discord.TextChannel)){
      message.reply("You cannot perform a **" + command_prefix + "playsound** command with those arugments from within a Direct Message. **" + command_prefix + "playsound ?** is allowed.");
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
        var obj_keys = Object.keys(this.util.soundData);
        var random_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
        this.util.playSound(channel, path + "/" + this.util.soundData[random_key].file, stream_options);
        this.util.logStandardCommand(message, "playsound");
      }else if (arg1.startsWith("+")){
        var tags = body.substring(1).split(" ");
        var collection = this.util.createMediaSubCollection(this.util.soundData, tags, true, false);
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
        var collection = this.util.createMediaSubCollection(this.util.soundData, tags, false, false);
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
        var collection = this.util.createMediaSubCollection(this.util.soundData, tags, true, true);
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

  purgemusicCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    if (arg1 == "DELETE"){
      this.util.musicData = {};
      var file = this.bot.basic.music_path + "/_music.json";
      fs.writeFile(file, JSON.stringify(this.util.musicData, null, 4), function(err){
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
      this.util.soundData = {};
      var file = this.bot.basic.sound_path + "/_sounds.json";
      fs.writeFile(file, JSON.stringify(this.util.soundData, null, 4), function(err){
        return;
      });
      this.util.logStandardCommand(message, "purgesounds");
      this.util.cleanupMessage(message);
    }else{
      message.author.send("Are you sure you want to do this? The entire sound library structure will be deleted but the files will remain on disk.\nIf you know what you are doing, run **!purgesounds DELETE** to confirm.");
      this.util.cleanupMessage(message);
    }
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

  removesongCommand(message, arg1) {
    if (!this.util.isManager(message.member)){
      message.author.send("You do not have permission to use that command.");
      this.util.cleanupMessage(message);
      return;
    }
    var json_data = this.util.musicData;
    var song = json_data[arg1];
    if (song){
      var filename = sound.file;
      fs.unlink(this.bot.basic.music_path + "/" + filename, function(){});
      delete json_data[arg1];
      var file = this.bot.basic.music_path + "/_music.json";
      fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
        return;
      });
      this.util.musicData = require("." + this.bot.basic.music_path + "/_music.json");
      this.util.logStandardCommand(message, "purgemusic");
      this.util.logStandardCommand(message, "removesong");
    }else{
      message.author.send("The song '" + arg1 + "' does not exist.");
    }
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
    var sound = json_data[arg1];
    if (sound){
      var filename = sound.file;
      fs.unlink(this.bot.basic.sound_path + "/" + filename, function(){});
      delete json_data[arg1];
      var file = this.bot.basic.sound_path + "/_sounds.json";
      fs.writeFile(file, JSON.stringify(json_data, null, 4), function(err){
        return;
      });
      this.util.soundData = require("." + this.bot.basic.sound_path + "/_sounds.json");
      this.util.logStandardCommand(message, "removesound");
    }else{
      message.author.send("The sound '" + arg1 + "' does not exist.");
    }
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
    var user = message.mentions.users.first();
    var id = null;
    var username = null;
    if (user){
      id = user.id;
      username = user.username;
      if (user.bot){
        message.author.send("You can not change the sounds of bot accounts.");
        this.util.cleanupMessage(message);
        return;
      }
    }else{
      id = message.author.id;
      username = message.author.username;
    }
    if (!arg2 && !user){
      if (this.util.setUserSound(id, username, arg1)){
        message.author.send("Your user sound has been successfully changed.");
        this.util.logStandardCommand(message, "setusersound");
      }else{
        message.author.send("The sound '" + arg1 + "' does not exist.");
      }
      this.util.cleanupMessage(message);
      return;
    }
    if (!this.util.isAdmin(message.member) && id != message.author.id){
      message.author.send("You do not have permission to change the sounds of other users.");
      this.util.cleanupMessage(message);
      return;
    }
    if (!arg1) {
      message.author.send("Your command is missing an @mention of the target user.");
      this.util.cleanupMessage(message);
      return;
    }
    if (isNaN(id) || !(arg1.includes("<@") && arg1.includes(">"))){
      message.author.send("The first argument of that command is not a proper @mention of target user.");
    }else if (this.util.setUserSound(id, username, arg2)){
      message.author.send("The sound for " + username + " has been successfully changed.");
      this.util.logStandardCommand(message, "setusersound");
    }else{
      message.author.send("The sound '" + arg2 + "' does not exist.");
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

  songinfoCommand(message, body) {
    var args = body.split(" ");
    var arg1 = args[0];
    var song = this.util.getSongInfo(arg1.toLowerCase());
    if (song) {
      if (this.util.isAdmin(message.member)){
        //TODO: Apply changes to song info based on command arguments
      }
      var discord_bot = this.bot;
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" +song.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" +song.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.addField(song.name, "File: " + song.file + "\nArtists: " + artists + "\nTags: " + tags + "");
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
    var sound = this.util.getSoundInfo(arg1.toLowerCase());
    if (sound) {
      if (this.util.isAdmin(message.member)){
        //TODO: Apply changes to sound info based on command arguments
      }
      var discord_bot = this.bot;
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" + sound.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" +sound.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
      embed.addField(sound.name, "File: " + sound.file + "\nArtists: " + artists + "\nTags: " + tags + "");
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
