const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ResponseHandler = require('./AI/ResponseHandler.js');

class Util {
  constructor(bot) {
    this.bot = bot;
    this.responseHandler = bot.responseHandler;
    this.musicData = require("." + this.bot.basic.music_path + "/_music.json");
    this.soundData = require("." + this.bot.basic.sound_path + "/_sounds.json");
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
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    embed.setThumbnail(this.bot.webAssets.packetcloud_icon);
    embed.addField("About ALVIS", aboutBot + "v" + this.bot.basic.version);
    return embed;
  }

  generateHelpEmbed(admin, manager) {
    var prefix = this.bot.basic.command_prefix;
    var cmdList = this.bot.responses.cmdList;
    var embed = new Discord.RichEmbed();
    embed.setFooter("Alternatively you can @mention or DM me, and we can converse.");
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    embed.setAuthor("Available Commands:", null, this.bot.webAssets.alvis_github);
    embed.setThumbnail(this.bot.webAssets.packetcloud_icon);
    for (var i = 0; i < cmdList.length; i++){
      var cmd = cmdList[i];
      if ((!cmd.admin_command && !cmd.manager_command)||(cmd.admin_command && admin)||(cmd.manager_command && manager)){
        embed.addField(cmd.name,"`" + prefix + cmd.syntax + "`\n" + cmd.description + "\n");
      }
    }
    return embed;
  }

  sendMusicList(message, tags, strict, exact) {
    var search_criteria = "";
    if (tags){
      search_criteria = tags.join(" ");
      if (strict){
        search_criteria = "&" + search_criteria;
      }
      search_criteria = "| Tags: " + search_criteria;
    }
    var collection = this.createMediaSubCollection(this.musicData, tags, strict, exact);
    const charlimit = 1024;
    var isFirst = true;
    var body = "";
    var results_number = 0
    var embed = new Discord.RichEmbed();
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    for (var key in collection){
      if (collection.hasOwnProperty(key)){
        var nextsong = collection[key];
        if (body.length + nextsong.name.length > charlimit){
          if (isFirst){
            embed.addField("Songs:", body);
            isFirst = false;
            body = "";
          }else{
            embed.addField("==============================", body);
            body = "";
          }
        }
        body = body + nextsong.name + "\n"
        results_number += 1;
      }
    }
    if (results_number){
      if (isFirst){
        embed.addField("Songs:", body);
      }else{
        embed.addField("==============================", body);
      }
      if (results_number == 1){
        embed.setFooter("1 result " + search_criteria);
      }else{
        embed.setFooter(results_number + " results " + search_criteria);
      }
    }else{
      embed.addField("Songs:", "No Results");
      embed.setFooter("0 results " + search_criteria);
    }
    message.author.send("", {embed: embed});
  }

  sendSoundList(message, tags, strict, exact) {
    var search_criteria = "";
    if (tags){
      search_criteria = tags.join(" ");
      if (strict){
        search_criteria = "&" + search_criteria;
      }
      search_criteria = "| Tags: " + search_criteria;
    }
    var collection = this.createMediaSubCollection(this.soundData, tags, strict, exact);
    const charlimit = 1024;
    var isFirst = true;
    var body = "";
    var results_number = 0
    var embed = new Discord.RichEmbed();
    embed.setColor(parseInt(this.bot.colours.bot_embed_colour));
    for (var key in collection){
      if (collection.hasOwnProperty(key)){
        var nextsound = collection[key];
        if (body.length + nextsound.name.length > charlimit){
          if (isFirst){
            embed.addField("Sounds:", body);
            isFirst = false;
            body = "";
          }else{
            embed.addField("==============================", body);
            body = "";
          }
        }
        body = body + nextsound.name + "\n"
        results_number += 1;
      }
    }
    if (results_number){
      if (isFirst){
        embed.addField("Sounds:", body);
      }else{
        embed.addField("==============================", body);
      }
      if (results_number == 1){
        embed.setFooter("1 result " + search_criteria);
      }else{
        embed.setFooter(results_number + " results " + search_criteria);
      }
    }else{
      embed.addField("Sounds:", "No Results");
      embed.setFooter("0 results " + search_criteria);
    }
    message.author.send("", {embed: embed});
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
      return this.musicData[song_name];
    }else{
      return null;
    }
  }

  getSoundInfo(sound_name) {
    if (this.soundData.hasOwnProperty(sound_name)){
      return this.soundData[sound_name];
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
    var discord_bot = this.bot;
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (!voiceChannel.joinable || !voiceChannel.speakable || voiceChannel.full) return;
    if (voiceChannel == null || filepath == null) return;
    var dispatchers = this.bot.basic.dispatchers;
    if (voiceChannel.guild.voiceConnection) return;
    voiceChannel.join().then((connection) => {
      dispatchers[voiceChannel.guild.id] = connection.playFile(filepath, stream_options);
      connection.on('error', () => {
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
    var discord_bot = this.bot;
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (voiceChannel == null || url == null) return;
    var dispatchers = this.bot.basic.dispatchers;
    if (voiceChannel.guild.voiceConnection) return;
    voiceChannel.join().then((connection) => {
  		var stream = ytdl(url, {filter: 'audioonly'});
  		dispatchers[voiceChannel.guild.id] = connection.playStream(stream, stream_options);
      connection.on('error', () => {
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

  pauseDispatcher(server_id) {
    this.bot.basic.dispatchers[server_id].pause();
  }

  resumeDispatcher(server_id) {
    this.bot.basic.dispatchers[server_id].resume();
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
