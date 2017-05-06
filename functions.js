const Discord = require("discord.js");
var fs = require('fs');
const Cleverbot = require('cleverbot');
const ytdl = require('ytdl-core');
var constants = require("./constants.js");
var variables = require("./variables.js");
var timeLog = require("./timeLog.js");

class functions {

  //console
  logger(string){
  	let currentTime = new Date();
  	let currentHour = currentTime.getHours();
  	let currentMinute = currentTime.getMinutes();
  	let currentSecond = currentTime.getSeconds();
  	let time = "[" + ("0" + currentHour).slice(-2) + ":" + ("0" + currentMinute).slice(-2) + ":" + ("0" + currentSecond).slice(-2) + "] ";
  	console.log(time + string);
    if (variables.log_message) {
      this.textChatLog(time + string);
    }
  }

  textChatLog(string){
    let old_content = variables.log_message.content;
    let length = old_content.length;
    let stripped_content = old_content.substring(0, length-13);
    if (length + string.length >= 1800){
      variables.log_message.edit(stripped_content + '\n' + string + "\n```:floppy_disk:");
      let new_log_message_content = "**Bot Log:**\n```\n```:pencil2:";
      variables.log_message.channel.send(new_log_message_content, {split: true}).then(message => this.setLogMessageVariable(message));
    }else{
      variables.log_message.edit(stripped_content + '\n' + string + "\n```:pencil2:");
    }
  }


  //variables
  commandVariablesSetup(msg) {
    variables.blocked = false;
		variables.spamBlocked = false;
		variables.blacklisted = false;
    if (this.blockForSpam(msg)){
      variables.blocked = true;
      variables.spamBlocked = true;
    }
    if (msg.channel instanceof Discord.TextChannel) {
      if (this.userIsBlacklisted(msg.author.id, msg.guild.id)){
        variables.blocked = true;
        variables.blacklisted = true;
      }
    }
  }

  keywordVariablesSetup(msg) {
    variables.blocked = false;
		variables.spamBlocked = false;
		variables.blacklisted = false;
    if (this.blockForSpam(msg)){
      variables.blocked = true;
      variables.spamBlocked = true;
    }
    if (msg.channel instanceof Discord.TextChannel) {
      if (this.userIsBlacklisted(msg.author.id, msg.guild.id)){
        variables.blocked = true;
        variables.blacklisted = true;
      }
    }
  }

  setBlockedVariable(state) {
    variables.blocked = state;
  }

  setSpamBlockedVariable(state) {
    variables.spamBlocked = state;
  }

  setBlacklistedVariable(state) {
    variables.blacklisted = state;
  }

  setBotNameVariable(name) {
    variables.bot_name = name;
  }

  setBotUserIdVariable(id) {
    variables.bot_user_id = id;
  }

  setLogMessageVariable(message) {
    variables.log_message = message;
  }

  getBlockedVariable() {
    return variables.blocked;
  }

  getSpamBlockedVariable() {
    return variables.spamBlocked;
  }

  getBlacklistedVariable() {
    return variables.blacklisted;
  }

  getBotNameVariable() {
    return variables.bot_name;
  }

  getBotUserIdVariable() {
    return variables.bot_user_id;
  }


  //constants
  getClientTokenConstant() {
    return constants.client_token;
  }

  getBotKeyConstant() {
    return constants.bot_key;
  }

  getCommandPrefixConstant() {
    return constants.command_prefix;
  }

  getClientGameConstant() {
    return constants.client_game;
  }


  //audio
  playSound(member, soundpath) {
  	let channel = member.voiceChannel;
  	if (channel == null) return;
  	channel.join().then((connection) => {
  		let dispatcher = connection.playFile(soundpath);
  		dispatcher.on('end', () => {
        connection.disconnect();
      });
  	}).catch(err => this.logger(err));
  }

  playStream(member, url) {
  	let channel = member.voiceChannel;
  	if (channel == null) return;
  	channel.join().then((connection) => {
  		let stream = ytdl(url, {filter : 'audioonly'});
  		let dispatcher = connection.playStream(stream, constants.streamOptions);
  		dispatcher.on('end', () => {
        connection.disconnect();
      });
  	}).catch(err => this.logger(err));
  }

  //commands
  aboutCommand(msg, command) {
		if (!variables.blocked){
			msg.reply(constants.about_response);
      this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  channelidCommand(msg, command) {
		if (msg.member.voiceChannel == null){
			msg.reply("You are not in a voice channel on this server.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to incorrect conditions");
		}else if (!variables.blocked){
			msg.reply("This voice channel's id is: '" + msg.member.voiceChannel.name + "'.");
      this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
    msg.delete();
  }

  displaylogsCommand(msg, command) {
    if (this.isAdmin(msg.member)){
      if (variables.log_message){
        msg.author.send("**Invalid Command**");
        msg.author.send("There is currently active logging to a text channel. Please close that log before starting a new one.");
      }else{
        let new_log_message_content = "**Bot Log:**\n```\n```:pencil2:";
        msg.channel.send(new_log_message_content, {split: true}).then(message => this.setLogMessageVariable(message));
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }else{
      msg.author.send("**Blocked Comamand**")
  		msg.author.send("You do not have permission to use this command");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to insufficient privileges");
    }
    msg.delete();
  }

  flipCommand(msg, command) {
		let outcome = ["heads", "tails"];
		if (!variables.blocked){
			msg.reply("You flipped " + outcome[this.getRandomInt(0, 1)] + ".");
      this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
	}

  helpCommand(msg, command) {
		if (!variables.blocked){
			msg.reply('**Bot Commands:**\n' + constants.cmdList);
      this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  muteCommand(msg, command) {
		if (!variables.blocked){
			if (this.voiceChannelBlacklistAdd(msg.member)){
				msg.reply('Sound commands muted on ' + msg.member.voiceChannel.name + " for " + Math.floor(constants.muteTime/60000) + " minutes.");
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  playmusicCommand(msg, arg1, command) {
    if (arg1 == '?' && !variables.blocked){
			msg.author.send("**Song names:**\n" + fs.readdirSync(constants.music_path).join().replace(/.mp3/g,"\n").replace(/,/g, ""), {split:true}).catch(err => this.logger(err));//if list is over 2000 characters, will complain in console, but works anyway.
      this.logger("Responded to '!" + command + " " + arg1 + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
    }else if (msg.member.voiceChannel == null){
      msg.author.send("**Invalid Command**");
      msg.author.send("You must be in a voice channel to play music.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to invalid conditions");
		}else if (this.voiceChannelIsBlacklisted(msg.member)){
      msg.author.send("**Blocked Command**");
      msg.author.send("Sound commands are muted on this voice channel.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because channel is muted");
    }else if (!this.voiceAllowedToConnect(msg.member)){
      msg.author.send("**Blocked Command**");
      msg.author.send("I do not have permission to join this voice channel.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because of insufficient bot privileges");
    }else if (!msg.guild.voiceConnection && !variables.blocked){
      let musicdir = fs.readdirSync(constants.music_path);
      let musicdirlen = musicdir.length;
      if (arg1 == null){
				this.playSound(msg.member, constants.music_path + "/" + musicdir[this.getRandomInt(1,musicdirlen)-1].replace(",", ""));
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
        if (musicdir.indexOf(arg1 + '.mp3') == -1) {
          msg.author.send("**Invalid Command**");
          msg.author.send("Requested song does not exist.");
          this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to incorrect argument(s)");
        }else{
          this.playSound(msg.member, constants.music_path + "/" + arg1 + ".mp3");
          this.logger("Responded to '!" + command + " " + arg1 + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
        }
			}
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  playsoundCommand(msg, arg1, command) {
    if (arg1 == '?' && !variables.blocked){
			msg.author.send("**Sound names:**\n" + fs.readdirSync(constants.sound_path).join().replace(/.mp3/g,"\n").replace(/,/g, ""), {split:true}).catch(err => this.logger(err));//if list is over 2000 characters, will complain in console, but works anyway.
      this.logger("Responded to '!" + command + " " + arg1 + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
    }else if (msg.member.voiceChannel == null){
      msg.author.send("**Invalid Command**");
      msg.author.send("You must be in a voice channel to play sounds.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to invalid conditions");
		}else if (this.voiceChannelIsBlacklisted(msg.member)){
      msg.author.send("**Blocked Command**");
      msg.author.send("Sound commands are muted on this voice channel.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because channel is muted");
    }else if (!this.voiceAllowedToConnect(msg.member)){
      msg.author.send("**Blocked Command**");
      msg.author.send("I do not have permission to join this voice channel.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because of insufficient bot privileges");
    }else if (!msg.guild.voiceConnection && !variables.blocked){
      let sounddir = fs.readdirSync(constants.sound_path);
      let sounddirlen = sounddir.length;
      if (arg1 == null){
				this.playSound(msg.member, constants.sound_path + "/" + sounddir[this.getRandomInt(1,sounddirlen)-1].replace(",", ""));
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
        if (sounddir.indexOf(arg1 + '.mp3') == -1) {
          msg.author.send("**Invalid Command**");
          msg.author.send("Requested sound does not exist.");
          this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to incorrect argument(s)");
        }else{
          this.playSound(msg.member, constants.sound_path + "/" + arg1 + ".mp3");
          this.logger("Responded to '!" + command + " " + arg1 + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
        }
			}
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  playstreamCommand(msg, arg1, command) {
    if (msg.member.voiceChannel == null){
      msg.author.send("**Invalid Command**");
      msg.author.send("You must be in a voice channel to play audio stream.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to incorrect conditions");
    }else if (this.voiceChannelIsBlacklisted(msg.member)){
      msg.author.send("**Blocked Command**");
      msg.author.send("Sound commands are muted on this voice channel.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because channel is muted");
    }else if (!this.voiceAllowedToConnect(msg.member)){
      msg.author.send("**Blocked Command**");
      msg.author.send("I do not have permission to join that voice channel.");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because of insufficient bot privileges");
    }else if (!msg.guild.voiceConnection && !variables.blocked){
			if (arg1 == null){
				msg.author.send("Please provide a URL to a video/audio stream you wish to play.");
        this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to incorrect argument(s)");
			}else{
				this.playStream(msg.member, arg1);
        this.logger("Responded to '!" + command + " " + arg1 + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}
    }else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
    msg.delete();
  }

  rollCommand(msg, arg1, command) {
    arg1 = parseInt(arg1);
    if (isNaN(arg1)){
      arg1 = 6;
    }else{
      arg1 = Math.round(arg1);
    }
		if (!variables.blocked){
			msg.reply("You rolled a " + this.getRandomInt(1, arg1));
      if (arg1 == 6){
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }else{
        this.logger("Responded to '!" + command + " " + arg1 + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  sayCommand(msg, command) {
		if (!variables.blocked && this.isManager(msg.member)){
			this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			let custom_message = msg.content.slice(4);
			msg.channel.send(custom_message);
      msg.delete();
		}else{
      this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
    }
  }

  serveridCommand(msg, command) {
		if (!variables.blocked){
			msg.reply("This server's id is: " + msg.guild.id);
      this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
    msg.delete();
  }

  stopCommand(msg, command) {
		if (!variables.blocked){
			if (msg.guild.voiceConnection){
				msg.guild.voiceConnection.disconnect();
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
				msg.author.send("**Invalid Command**");
				msg.author.send("No sound currently playing on server.");
        this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to incorrect conditions");
			}
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  stopdisplaylogsCommand(msg, command) {
    if (this.isAdmin(msg.member)){
      let old_content = variables.log_message.content;
      let length = old_content.length;
      let stripped_content = old_content.substring(0, length-9);
      variables.log_message.edit(stripped_content + ":floppy_disk:");
      variables.log_message = null;
      this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
    }else{
      msg.author.send("**Blocked Comamand**")
  		msg.author.send("You do not have permission to use this command");
      this.logger("Blocked '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because of insufficient bot privileges");
    }
    msg.delete();
  }

  unmuteCommand(msg, command) {
		if (!variables.blocked){
			if (this.voiceChannelBlacklistRemove(msg.member)){
				msg.reply('Sound commands unmuted on ' + msg.member.voiceChannel.name + ".");
        this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
        this.logger("Failed to execute '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " because channel was not muted");
      }
		}else{
      if (variables.spamBlocked){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
      }else if (variables.blacklisted){
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
      }else{
        this.logger("Ignored '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
      }
    }
		msg.delete();
  }

  //math
  largeDifference(n1, n2, dm) {
  	if (Math.abs(n1 - n2) > dm) return true;
  	return false;
  }

  getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //spam
  blockForSpam(message) {
  	let currentDate = new Date();
  	let authorid = message.author.id.toString();
  	if (!variables.requestDictionary[authorid]){
  		variables.requestDictionary[authorid] = new timeLog(currentDate);
  		return false;
  	}else if (!constants.allowSpam){
  		variables.requestDictionary[authorid].update(currentDate);
  		let dict = variables.requestDictionary[authorid];
  		if (!this.largeDifference(dict.date3, currentDate, constants.Sec1)) return true;
  		if (!this.largeDifference(dict.date5, currentDate, constants.Sec1 * 5)) return true;
  		if (!this.largeDifference(dict.date7, currentDate, constants.Sec1 * 15)) return true;
  		if (!this.largeDifference(dict.date10, currentDate, constants.Sec1 * 30)) return true;
  	}
  	return false;
  }

  messageSpam(recipient) {
  	recipient.send("**Blocked for Spam**");
  	recipient.send(constants.spamResponses[this.getRandomInt(1, constants.spamResponses['length'])]);
  }

  //media responses
  rFunnyResponse() {
  	return constants.rFunnyResponses[this.getRandomInt(1, constants.rFunnyResponses['length'])];
  }

  imgurResponse() {
  	return constants.imgurResponses[this.getRandomInt(1, constants.imgurResponses['length'])];
  }

  youtubeResponse() {
  	return constants.youtubeResponses[this.getRandomInt(1, constants.youtubeResponses['length'])];
  }

  //voice channel blacklist
  voiceAllowedToConnect(member){
    if (member.voiceChannel == null) return false;
    return member.voiceChannel.joinable;
  }

  voiceChannelIsBlacklisted(member){
  	let currentDate = new Date();
  	if (member.voiceChannel == null) return false;
    let srvr = null;
  	for (srvr in variables.voiceChannelBlacklist){
  		if (member.guild.id == variables.voiceChannelBlacklist[srvr].server && member.voiceChannel.name == variables.voiceChannelBlacklist[srvr].channel){
  			if (variables.voiceChannelBlacklist[srvr].expiration > currentDate){
  				return true;
  			}else{
  				variables.voiceChannelBlacklist.splice(srvr, 1);
  			}
  		}
  	}
  	return false;
  }

  voiceChannelBlacklistAdd(member){
  	if (member.voiceChannel == null){
  		member.send("**Invalid Command**");
  		member.send("You must be in a voice channel to mute.");
  		return false;
  	}
  	if (this.voiceChannelIsBlacklisted(member)){
  		member.send("**Invalid Command**");
  		member.send("Sound commands are already muted on this channel.");
  		return false;
  	}
    if (!this.voiceAllowedToConnect(member)){
      member.send("**Invalid Command**");
      member.send("I do not have permission to join that voice channel.");
      return false;
    }
  	let currentDate = new Date();
  	variables.voiceChannelBlacklist[variables.voiceChannelBlacklist.length] = {server:member.guild.id, channel:member.voiceChannel.name, expiration:new Date(currentDate.getTime() + constants.muteTime)};
  	return true;
  }

  voiceChannelBlacklistRemove(member){
  	if (!this.isAdmin(member)){
  		member.send("**Blocked Comamand**")
  		member.send("You do not have permission to use this command");
  		return false;
  	}
  	if (member.voiceChannel == null){
  		member.send("**Invalid Command**");
  		member.send("You must be in a voice channel to unmute.");
  		return false;
  	}
  	if (!this.voiceChannelIsBlacklisted(member)){
  		member.send("**Channel Not Muted**");
  		member.send("Cannot unmute a channel that is not muted.");
  		return false;
  	}
    let srvr = null;
  	for (srvr in variables.voiceChannelBlacklist){
  		if (variables.voiceChannelBlacklist[srvr].server == member.guild.id && variables.voiceChannelBlacklist[srvr].channel == member.voiceChannel.name){
  			variables.voiceChannelBlacklist.splice(srvr, 1);
  			return true;
  		}
  	}
  	return false;
  }

  //user blacklist
  userIsBlacklisted(member_id, server_id){
    let mem = null;
  	for (mem in variables.userBlacklist){
  		if (variables.userBlacklist[mem].user == member_id && variables.userBlacklist[mem].server == server_id){
  			return true;
  		}
  	}
  	return false;
  }

  userBlacklistAdd(member_id, server_id){
  	if (this.userIsBlacklisted(member_id, server_id)){
  		return;
  	}else{
  		variables.userBlacklist[userBlacklist.length] = {user: member_id, server: server_id};
  		return;
  	}
  }

  messageBlacklisted(recipient) {
  	recipient.send("**Blacklisted**");
  	recipient.send("You have been blacklisted from using me on this server.");
  }

  //permissions
  isManager(member) {
    let i = null;
  	for (i in variables.managerRolesList){
  		if (member.roles.has(variables.managerRolesList[i].role) && variables.managerRolesList[i].server == member.guild.id) return true;
  	}
  	return false;
  }

  isAdmin(member) {
  	if (this.isManager(member)) return true;
    let i = null;
  	for (i in variables.adminRolesList){
  		if (member.roles.has(variables.adminRolesList[i].role) && variables.adminRolesList[i].server == member.guild.id) return true;
  	}
  	return false;
  }

}

module.exports = functions;
