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
			this.logger("Responded to " + command + " command from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
		}else {
      this.logger("Responded to " + command + " command from " + message.author.username);
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
    if (max < min){
      return Math.floor(min);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  objectIsEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
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

  generateAboutEmbed() {
    var aboutBot = this.bot.responses.aboutBot;
    var embed = new Discord.RichEmbed();
    embed.setColor(0x1a75ff);
    embed.setThumbnail("https://static1.squarespace.com/static/590a3b36893fc0d31893235d/t/590a3b9a3a04112426fad651/1498631274219/?format=1500w");
    embed.addField("About ALVIS", aboutBot + "v" + this.bot.basic.version);
    return embed;
  }

  generateHelpEmbed(admin, manager) {
    var prefix = this.bot.basic.command_prefix;
    var cmdList = this.bot.responses.cmdList;
    var embed = new Discord.RichEmbed();
    embed.setFooter("Alternatively you can @mention or DM me, and we can converse.");
    embed.setColor(0x1a75ff);
    embed.setAuthor("Available Commands:", null, "https://github.com/packetcloud/alvis");
    embed.setThumbnail("https://static1.squarespace.com/static/590a3b36893fc0d31893235d/t/590a3b9a3a04112426fad651/1498631274219/?format=1500w");
    for (var i = 0; i < cmdList.length; i++){
      var cmd = cmdList[i];
      if ((!cmd.admin_command && !cmd.manager_command)||(cmd.admin_command && admin)||(cmd.manager_command && manager)){
        embed.addField(cmd.name,"`" + prefix + cmd.syntax + "`\n" + cmd.description + "\n");
      }
    }
    return embed;
  }

  sendMusicList(message, tags, strict, exact) {
    var collection = this.createMediaSubCollection(this.musicData, tags, strict, exact);
    const charlimit = 2000;
    var results_number = 0;
    var Output = "**__Songs:__**\n```\n";
    for (var key in collection){
      if (collection.hasOwnProperty(key)){
        var nextsong = collection[key];
        results_number += 1;
        if (nextsong.name.length + Output.length >= charlimit - 5){
          message.author.send(Output + "```");
          Output = "```\n" + nextsong.name + "\n";
        }else{
          Output = Output + nextsong.name + "\n";
        }
      }
    }
    if (results_number){
      if (results_number == 1){
        Output = Output + "```*1 result*";
      }else{
        Output = Output + "```*" + results_number + " results*";
      }
    }else{
      Output = Output + "No Results" + "```";
    }
    message.author.send(Output);
  }

  sendSoundList(message, tags, strict, exact) {
    var collection = this.createMediaSubCollection(this.soundData, tags, strict, exact);
    const charlimit = 2000;
    var results_number = 0;
    var Output = "**__Sounds:__**\n```\n";
    for (var key in collection){
      if (collection.hasOwnProperty(key)){
        var nextsound = collection[key];
        results_number += 1;
        if (nextsound.name.length + Output.length >= charlimit - 5){
          message.author.send(Output + "```");
          Output = "```\n" + nextsound.name + "\n";
        }else{
          Output = Output + nextsound.name + "\n";
        }
      }
    }
    if (results_number){
      if (results_number == 1){
        Output = Output + "```*1 result*";
      }else{
        Output = Output + "```*" + results_number + " results*";
      }
    }else{
      Output = Output + "No Results" + "```";
    }
    message.author.send(Output);
  }

  searchMediaForTags(media, tags, strict) {
    if (tags == null) return true;
    var i, j;
    if (strict){
      for (i = 0; i < tags.length; i++){
        var hit = false;
        var tag = tags[i].toLowerCase();
        if (media.name.toLowerCase().includes(tag)){
          hit = true;
          if (tags.length == 1 && media.name.toLowerCase() == tag) return 2;
        }
        for (j = 0; j < media.artists.length; j++){
          if (media.artists[j].toLowerCase().includes(tag)) hit = true;
        }
        for (j = 0; j < media.tags.length; j++){
          if (media.tags[j].toLowerCase().includes(tag)) hit = true;
        }
        for (j = 0; j < media.aliases.length; j++){
          if (media.aliases[j].toLowerCase().includes(tag)) hit = true;
        }
        if (!hit) return 0;
      }
      return 1;
    }else{
      for (i = 0; i < tags.length; i++){
        var tag = tags[i].toLowerCase();
        if (media.name.toLowerCase().includes(tag)){
          if (tags.length == 1 && media.name.toLowerCase() == tag) return 2;
          return 1;
        }
        for (j = 0; j < media.artists.length; j++){
          if (media.artists[j].toLowerCase().includes(tag)) return 1;
        }
        for (j = 0; j < media.tags.length; j++){
          if (media.tags[j].toLowerCase().includes(tag)) return 1;
        }
        for (j = 0; j < media.aliases.length; j++){
          if (media.aliases[j].toLowerCase().includes(tag)) return 1;
        }
      }
      return 0;
    }
  }

  getSongInfo(song_name){
    if (this.musicData.hasOwnProperty(song_name)){
      var song = this.musicData[song_name];
      var name = " - ";
      var file = " - ";
      var artists = " - ";
      var tags = " - ";
      if (song.name) name = song.name;
      if (song.file) file = song.file;
      if (song.artists.length) artists = song.artists.join(" | ");
      if (song.tags.length) tags = song.tags.join(" | ");
      var Output = "```\nSong Name:  " + name + "\nFile:       " + file + "\nArtists:    " + artists + "\nTags:       " + tags + "\n```";
      return Output;
    }else{
      return null;
    }
  }

  getSoundInfo(sound_name) {
    if (this.soundData.hasOwnProperty(sound_name)){
      var sound = this.soundData[sound_name];
      var name = " - ";
      var file = " - ";
      var artists = " - ";
      var tags = " - ";
      if (sound.name) name = sound.name;
      if (sound.file) file = sound.file;
      if (sound.artists.length) artists = sound.artists.join(" | ");
      if (sound.tags.length) tags = sound.tags.join(" | ");
      var Output = "```\nSound Name: " + name + "\nFile:       " + file + "\nArtists:    " + artists + "\nTags:       " + tags + "\n```";
      return Output;
    }else{
      return null;
    }
  }

  createMediaSubCollection(media_collection, tags, strict, exact) {
    var result_collection = {};
    for (var key in media_collection){
      if (media_collection.hasOwnProperty(key)) {
        var nextitem = media_collection[key];
        var result = this.searchMediaForTags(nextitem, tags, strict);
        if (result == 2 && exact){
          result_collection = {};
          result_collection[key] = nextitem;
          return result_collection;
        }else if (result){
          result_collection[key] = nextitem;
        }
      }
    }
    return result_collection;
  }

  playSound(voiceChannel, filepath, options) {
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (voiceChannel.guild.voiceConnection) return;
    if (!voiceChannel.joinable || !voiceChannel.speakable || voiceChannel.full) return;
    if (voiceChannel == null || filepath == null) return;
    var dispatchers = this.bot.basic.dispatchers;
    voiceChannel.join().then((connection) => {
      dispatchers[voiceChannel.guild.id] = connection.playFile(filepath, stream_options);
      connection.on('error', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        dispatchers[voiceChannel.guild.id].end();
      });
      connection.on('failed', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        dispatchers[voiceChannel.guild.id].end();
      });
      dispatchers[voiceChannel.guild.id].on('end', () => {
        connection.disconnect();
      });
    }).catch((error) => {
      this.logger("An error occured in sound playback:");
      console.log(error.message);
    })
  }

  playStream(voiceChannel, url, options) {
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (voiceChannel == null || url == null) return;
    var dispatchers = this.bot.basic.dispatchers;
    voiceChannel.join().then((connection) => {
  		var stream = ytdl(url, {filter: 'audioonly'});
  		dispatchers[voiceChannel.guild.id] = connection.playStream(stream, stream_options);
      connection.on('error', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        dispatchers[voiceChannel.guild.id].end();
      });
      connection.on('failed', () => {
        this.logger("Connection with Discord voice servers has been interrupted.");
        dispatchers[voiceChannel.guild.id].end();
      });
  		dispatchers[voiceChannel.guild.id].on('end', () => {
        connection.disconnect();
      });
  	}).catch((error) => {
      this.logger("An error occured in stream playback:");
      console.log(error.message);
    });
  }

  endDispatcher(server_id) {
    this.bot.basic.dispatchers[server_id].end();
    this.bot.messageCleanupQueue.expireTag("currentlyplaying" + server_id);
  }

  setLastSongEmbed(server_id, embed) {
    this.bot.basic.last_played[server_id] = embed;
  }

  getLastSongEmbed(server_id) {
    var embed = this.bot.basic.last_played[server_id];
    return embed;
  }

  setIntegerVolume(integerVolume) {
    integerVolume = Math.floor(integerVolume/10);
    if (integerVolume > 10) integerVolume = 10;
    if (integerVolume < 1) integerVolume = 1;
    var volumeMap = [0.02, 0.04, 0.06, 0.09, 0.13, 0.20, 0.30, 0.45, 0.67, 1];
    this.setVolume(volumeMap[integerVolume - 1]);
  }

  setVolume(newVolume) {
    this.bot.basic.stream_options.volume = newVolume;
  }

  increaseVolume() {
    var volumeMap = [0.02, 0.04, 0.06, 0.09, 0.13, 0.20, 0.30, 0.45, 0.67, 1];
    var length = volumeMap.length;
    var volume = this.bot.basic.stream_options.volume;
    for (var i = 0; i < length; i++){
      if (volume == volumeMap[i]){
        var volume_index = i + 2;
        if (volume_index > 9){
          this.setIntegerVolume(100);
          return 100;
        }
        this.setIntegerVolume((volume_index+1) * 10);
        return (volume_index + 1) * 10;
      }
    }
    return -1;
  }

  decreaseVolume() {
    var volumeMap = [0.02, 0.04, 0.06, 0.09, 0.13, 0.20, 0.30, 0.45, 0.67, 1];
    var length = volumeMap.length;
    var volume = this.bot.basic.stream_options.volume;
    for (var i = 0; i < length; i++){
      if (volume == volumeMap[i]){
        var volume_index = i - 2;
        if (volume_index < 1){
          this.setIntegerVolume(10);
          return 10;
        }
        this.setIntegerVolume((volume_index + 1) * 10);
        return (volume_index + 1) * 10;
      }
    }
    return -1;
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
      console.log("null");
      delete this.bot.userSounds[id];
    }else if (this.soundData[sound]){
      this.bot.userSounds[id] = {"id": id, "username":username,"sound": sound};
    }else{
      return false;
    }
    fs.writeFile("./src/userSounds.json", JSON.stringify(this.bot.userSounds, null, 4), function(err){
      if (err) console.log(err);
    });
    return true;
  }

  sendUserSounds(message) {
    const charlimit = 2000;
    var Output = "**__User Sounds:__**\n```\n";
    for (var key in this.bot.userSounds){
      if (this.bot.userSounds.hasOwnProperty(key)) {
        var nextuser = this.bot.userSounds[key];
        var nextEntry = "User: " + nextuser.username + "\nID: " + nextuser.id + "\nSound: " + nextuser.sound;
        if (nextEntry.length + Output.length >= charlimit - 5){
          message.author.send(Output + "```");
          Output = "```\n" + nextEntry;
        }else{
          Output = Output + nextEntry + "\n\n";
        }
      }
    }
    Output = Output + "```";
    message.author.send(Output);
  }
}

module.exports = Util;
