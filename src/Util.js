const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ResponseHandler = require('./AI/ResponseHandler.js');
const https = require('https');

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
    var query_content = message.cleanContent;
    query_content = query_content.replace("@" + this.bot.basic.username, "").replace(/ {2,}/g, " ").replace(/@/g, "");
    if (query_content.length < 1) query_content = "?";
    var handler = this.responseHandler;
    var request = this.bot.chatbot.textRequest(query_content, {
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
    if (this.bot.permissions.manager_role == "") return false;
  	if (member.roles.find("name", this.bot.permissions.manager_role)) return true;
  	return false;
  }

  isAdmin(member) {
    if (this.isManager(member)) return true;
    if (this.bot.permissions.admin_role == "") return false;
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
      search_criteria = "\"" +tags.join("\", \"") + "\"";
      if (strict){
        search_criteria = "+" + search_criteria;
      }else{
        search_criteria = "-" + search_criteria;
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
        if (body.length + nextsong.name.length >= charlimit){
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
      search_criteria = "\"" +tags.join("\", \"") + "\"";
      if (strict){
        search_criteria = "+" + search_criteria;
      }else{
        search_criteria = "-" + search_criteria;
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
        if (body.length + nextsound.name.length >= charlimit){
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

  addSongs(message, force, args) {
    message.attachments.forEach(attachment => this.addSong(message, attachment, force, args));
  }

  addSounds(message, force, args) {
    message.attachments.forEach(attachment => this.addSound(message, attachment, force, args));
  }

  addSong(message, attachment, force, args) {
    var discord_bot = this.bot;
    const filename = attachment.filename.split('.')[0].split(" ")[0];
    const extension = attachment.filename.split('.')[attachment.filename.split('.').length - 1];
    if (!discord_bot.basic.audio_formats.includes(extension)) {
      message.author.send("The file '" + attachment.filename + "' is an invalid format.");
      return;
    }
    if (attachment.filesize > discord_bot.config.max_upload_size) {
      message.author.send("The file '" + attachment.filename + "' is too large.");
      return;
    }
    if (fs.existsSync(discord_bot.basic.music_path + "/" + attachment.filename) && !force){
      message.author.send("The file '" + attachment.filename + "' already exists in my music library.");
      return;
    }
    var song_obj = {"name": filename, "file": attachment.filename, "extension": extension, "artists": [], "aliases": [], "tags": []};
    https.get(attachment.url, (response) => {
      const file = fs.createWriteStream(discord_bot.basic.music_path + "/" + attachment.filename);
      response.pipe(file);
      discord_bot.util.setAudioData(discord_bot.util.musicData, discord_bot.basic.music_path + "/_music.json", song_obj);
      discord_bot.util.musicData = require("." + discord_bot.basic.music_path + "/_music.json");
      if (args){
        song_obj = discord_bot.util.modifyAudioData(song_obj, args);
        discord_bot.util.updateAudioData("music", song_obj);
      }
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" + song_obj.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" +song_obj.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(discord_bot.colours.bot_embed_colour));
      embed.addField(song_obj.name, "File: " + song_obj.file + "\nArtists: " + artists + "\nTags: " + tags + "");
      message.reply("Song added:", {embed: embed})
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }).on('error', (error) => {
      console.error(error);
      message.author.send("Something went wrong when adding song '" + attachment.filename + "'.");
    });
  }

  addSound(message, attachment, force, args) {
    var discord_bot = this.bot;
    const filename = attachment.filename.split('.')[0].split(" ")[0];
    const extension = attachment.filename.split('.')[attachment.filename.split('.').length - 1];
    if (!discord_bot.basic.audio_formats.includes(extension)) {
      message.author.send("The file '" + attachment.filename + "' is an invalid format.");
      return;
    }
    if (attachment.filesize > discord_bot.config.max_upload_size) {
      message.author.send("The file '" + attachment.filename + "' is too large.");
      return;
    }
    if (fs.existsSync(discord_bot.basic.sound_path + "/" + attachment.filename) && !force){
      message.author.send("The file '" + attachment.filename + "' already exists in my sound library.");
      return;
    }
    var sound_obj = {"name": filename, "file": attachment.filename, "extension": extension, "artists": [], "aliases": [], "tags": []};
    https.get(attachment.url, (response) => {
      const file = fs.createWriteStream(discord_bot.basic.sound_path + "/" + attachment.filename);
      response.pipe(file);
      discord_bot.util.setAudioData(discord_bot.util.soundData, discord_bot.basic.sound_path + "/_sounds.json", sound_obj);
      discord_bot.util.soundData = require("." + discord_bot.basic.sound_path + "/_sounds.json");
      if (args){
        sound_obj = discord_bot.util.modifyAudioData(sound_obj, args);
        discord_bot.util.updateAudioData("sounds", sound_obj);
      }
      var artists = "-";
      var tags = "-";
      if (artists.length) artists = "\"" + sound_obj.artists.join("\", \"") + "\"";
      if (tags.length) tags = "\"" + sound_obj.tags.join("\", \"") + "\"";
      var embed = new Discord.RichEmbed();
      embed.setColor(parseInt(discord_bot.colours.bot_embed_colour));
      embed.addField(sound_obj.name, "File: " + sound_obj.file + "\nArtists: " + artists + "\nTags: " + tags + "");
      message.reply("Sound added:", {embed: embed})
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    }).on('error', (error) => {
      console.error(error);
      message.author.send("Something went wrong when adding sound '" + attachment.filename + "'.");
    });
  }

  addAudioTag(audio_data, tag) {
    if (audio_data.tags.includes(tag)) return audio_data;
    audio_data.tags.push(tag);
    return audio_data;
  }

  removeAudioTag(audio_data, tag) {
    var index = audio_data.tags.indexOf(tag);
    if (index == -1){
      return audio_data;
    }else{
      audio_data.tags.splice(index, 1);
      return audio_data;
    }
  }

  addAudioArtist(audio_data, artist) {
    if (audio_data.artists.includes(artist)) return audio_data;
    audio_data.artists.push(artist);
    return audio_data;
  }

  removeAudioArtist(audio_data, artist) {
    var index = audio_data.artists.indexOf(artist);
      if (index == -1){
      return audio_data;
    }else{
      audio_data.artists.splice(index, 1);
      return audio_data;
    }
  }

  updateAudioData(database, audio_data) {
    if (database == "music"){
      var id = audio_data.name;
      this.musicData[id] = audio_data;
      this.writeAudioData(this.musicData, this.bot.basic.music_path + "/_music.json");
      return true;
    }else if (database == "sounds"){
      var id = audio_data.name;
      this.soundData[id] = audio_data;
      this.writeAudioData(this.soundData, this.bot.basic.sound_path + "/_sounds.json");
      return true;
    }
    return false;
  }

  writeAudioData(data, file) {
    fs.writeFile(file, JSON.stringify(data, null, 4), function(err){
      console.log(err);
    });
  }

  modifyAudioData(audio_data, edits) {
    for (var i = 0; i < edits.length; i++){
      var edit = edits[i];
      if (edit.startsWith("+&")){
        edit = edit.substring(2).replace(/_/g, " ");
        audio_data = this.addAudioArtist(audio_data, edit);
      }else if (edit.startsWith("-&")){
        edit = edit.substring(2).replace(/_/g, " ");
        audio_data = this.removeAudioArtist(audio_data, edit);
      }else if (edit.startsWith("+")){
        edit = edit.substring(1).toLowerCase().replace(/_/g, " ");
        audio_data = this.addAudioTag(audio_data, edit);
      }else if (edit.startsWith("-")){
        edit = edit.substring(1).toLowerCase().replace(/_/g, " ");
        audio_data = this.removeAudioTag(audio_data, edit);
      }
    }
    return audio_data;
  }

  setIntegerVolume(integerVolume) {
    integerVolume = Math.floor(integerVolume/10);
    if (integerVolume > 10) integerVolume = 10;
    if (integerVolume < 1) integerVolume = 1;
    var volumeMap = [0.02, 0.04, 0.06, 0.09, 0.13, 0.20, 0.30, 0.45, 0.67, 1];
    this.setVolume(volumeMap[integerVolume - 1]);
  }

  getIntegerVolume() {
    var volumeMap = [0.02, 0.04, 0.06, 0.09, 0.13, 0.20, 0.30, 0.45, 0.67, 1];
    var length = volumeMap.length;
    var volume = this.bot.basic.stream_options.volume;
    for (var i = 0; i < length; i++){
      if (volume == volumeMap[i]){
        return (i + 1) * 10;
      }
    }
    return -1;
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
      delete this.bot.userSounds[id];
    }else if (this.soundData[sound]){
      this.bot.userSounds[id] = {"id": id, "username":username,"sound": sound};
    }else{
      return false;
    }
    fs.writeFile("./config/userSounds.json", JSON.stringify(this.bot.userSounds, null, 4), function(err){
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

  getMemberFromString(members, string) {
    var memeber = null;
    member = members.find(val => val.displayName == string);
    if (!member){
      var member = members.find(val => val.user.username == string);
    }
    return member;
  }
}

module.exports = Util;
