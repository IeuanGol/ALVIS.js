const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

class Util {
  constructor(bot) {
    this.bot = bot;
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

  queryChatbotResponse(message) {
    this.bot.chatbot.query(message.cleanContent.replace(this.bot.basic.username, "").replace(/@/g, ""))
    .then(function(response){
      message.reply(response.output);
    });
    if (message.channel instanceof Discord.DMChannel){
			this.logger("Replied to DM from " + message.author.username);
		}else if (message.channel instanceof Discord.TextChannel) {
			this.logger("Replied to mention from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
		}else {
      this.logger("Replied to message from " + message.author.username);
    }
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
    if (voiceChannel == null || filepath == null) return;
    voiceChannel.join().then((connection) => {
      const dispatcher = connection.playFile(filepath);
      dispatcher.on('end', () => {
        connection.disconnect();
      });
    }).catch((error) => {
      this.logger("An error occured in sound playback:");
      console.log(error);
    })
  }

  playStream(voiceChannel, url) {
    if (voiceChannel == null || url == null) return;
    voiceChannel.join().then((connection) => {
  		const stream = ytdl(url, {filter: 'audioonly'});
  		const dispatcher = connection.playStream(stream, this.bot.basic.stream_options);
  		dispatcher.on('end', () => {
        connection.disconnect();
      });
  	}).catch((err) => {
      this.logger(err)
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
}

module.exports = Util;
