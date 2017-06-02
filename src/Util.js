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
    for (var i in this.bot.permissions.manager_role_ids){
  		if (member.roles.has(this.bot.permissions.manager_role_ids[i])) return true;
  	}
  	return false;
  }

  isAdmin(member) {
    if (this.isManager(member)) return true;
    for (var i in this.bot.permissions.admin_role_ids){
  		if (member.roles.has(this.bot.permissions.admin_role_ids[i])) return true;
  	}
  	return false;
  }

  sendMusicList(message, tag) {
    if (tag == null){
      const charlimit = 2000;
      var Output = "**Songs:**";
      for (var key in this.musicData){
        if (this.musicData.hasOwnProperty(key)) {
          var nextsong = this.musicData[key];
          if (nextsong.name.length + Output.length >= charlimit){
            message.author.send(Output);
            Output = nextsong.name;
          }else{
            Output = Output + "\n" + nextsong.name;
          }
        }
      }
      message.author.send(Output);
    }else{
        //TODO: Tag Lookup
    }
  }

  sendSoundList(message, tag) {
    if (tag == null){
      const charlimit = 2000;
      var Output = "**Sounds:**";
      for (var key in this.soundData){
        if (this.soundData.hasOwnProperty(key)) {
          var nextsound = this.soundData[key];
          if (nextsound.name.length + Output.length >= charlimit){
            message.author.send(Output);
            Output = nextsound.name;
          }else{
            Output = Output + "\n" + nextsound.name;
          }
        }
      }
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

  getAudioData(json_file, sound_name) {
    return json_file.sound_name;
  }

  setAudioData(json_data, file, sound_obj) {
    json_data[sound_obj.name] = sound_obj;
    fs.writeFile(file, JSON.stringify(json_data), function(err){
      return;
    });
  }

  setUserSound(id, sound) {
    if (sound == null){
      delete this.bot.userSounds[id];
    }else if (this.soundData[sound]){
      this.bot.userSounds[id] = {};
      this.bot.userSounds[id].sound = this.soundData[sound].file;
    }else{
      return false;
    }
    fs.writeFile("./config/userSounds.json", JSON.stringify(this.bot.userSounds), function(err){
      return;
    });
    return true;
  }

  sendUserSounds(message) {
    var obj_keys = Object.keys(this.bot.userSounds);
    var usersounds = this.bot.userSounds;
    for (var i in obj_keys){
      var user_id = obj_keys[i];
      this.bot.fetchUser(user_id).then(function(user){
        message.author.send("**" + user.username + ":** " + usersounds[user.id].sound);
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}

module.exports = Util;
