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
          if (nextsong.name.length + Output.length >= charlimit - 5){
            message.author.send(Output);
            Output = "```\n" + nextsong.name + "\n";
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
      var Output = "**__Sounds:__**\n```\n";
      for (var key in this.soundData){
        if (this.soundData.hasOwnProperty(key)) {
          var nextsound = this.soundData[key];
          if (nextsound.name.length + Output.length >= charlimit - 5){
            message.author.send(Output + "```");
            Output = "```\n" + nextsound.name + "\n";
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

  playSound(voiceChannel, filepath, options) {
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (voiceChannel.guild.voiceConnection) return;
    if (!voiceChannel.joinable || !voiceChannel.speakable || voiceChannel.full) return;
    if (voiceChannel == null || filepath == null) return;
    voiceChannel.join().then((connection) => {
      var dispatcher = connection.playFile(filepath, stream_options);
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
      console.log(error.message);
    })
  }

  playStream(voiceChannel, url, options) {
    var stream_options = this.bot.basic.stream_options;
    if (options) stream_options = options;
    if (voiceChannel == null || url == null) return;
    voiceChannel.join().then((connection) => {
  		var stream = ytdl(url, {filter: 'audioonly'});
  		var dispatcher = connection.playStream(stream, stream_options);
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
      this.logger("An error occured in stream playback:");
      console.log(error.message);
    });
  }

  setIntegerVolume(integerVolume) {
    integerVolume = Math.floor(integerVolume/10);
    if (integerVolume > 10) integerVolume = 10;
    if (integerVolume < 1) integerVolume = 1;
    var volumeMap = [0.025, 0.005, 0.01, 0.02, 0.04, 0.07, 0.13, 0.25, 0.50, 1];
    this.setVolume(volumeMap[integerVolume - 1]);
  }

  setVolume(newVolume) {
    this.bot.basic.stream_options.volume = newVolume;
  }

  increaseVolume() {
    var volumeMap = [0.025, 0.005, 0.01, 0.02, 0.04, 0.07, 0.13, 0.25, 0.50, 1];
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
    var volumeMap = [0.025, 0.005, 0.01, 0.02, 0.04, 0.07, 0.13, 0.25, 0.50, 1];
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
