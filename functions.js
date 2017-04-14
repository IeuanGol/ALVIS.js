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
  }

  commandLogger(msg, command) {
    if (variables.generated_response) {
  		if (variables.blacklisted) {
  			this.logger("Blocked command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist");
  			this.messageBlacklisted(msg.author);
  		}else if (variables.spamBlocked) {
  			this.logger("Blocked command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
  			this.messageSpam(msg.author);
  		}else{
  			this.logger("Responded to '!" + command + "' command from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
  		}
  	}
  }

  keywordLogger(msg) {
    if (variables.generated_response && !variables.blocked) {
  		this.logger("Responded to keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
  	}else if(variables.spamBlocked){
  		this.logger("Ignored keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam.");
  	}
  }

  //variables
  commandVariablesSetup(msg) {
    variables.blocked = false;
		variables.spamBlocked = false;
		variables.blacklisted = false;
    variables.generated_response = false;
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
    variables.generated_response = false;
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

  setGeneratedResponseVariable(state) {
    variables.generated_response = state;
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

  getGeneratedResponseVariable() {
    return variables.generated_response;
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
  	channel.join().then(connection => {
  		let dispatcher = connection.playFile(soundpath);
  		dispatcher.on('end', end => {
        channel.leave();
      });
  	}).catch(err => this.logger(err));
  }

  playStream(member, url) {
  	let channel = member.voiceChannel;
  	if (channel == null) return;
  	channel.join().then(connection => {
  		let stream = ytdl(url, {filter : 'audioonly'});
  		let dispatcher = connection.playStream(stream, constants.streamOptions);
  		dispatcher.on('end', end => {
        channel.leave();
      });
  	}).catch(err => this.logger(err));
  }

  //commands
  channelidCommand(msg) {
    variables.generated_response = true;
		if (msg.member.voiceChannel == null){
			msg.reply("You are not in a voice channel on this server.");
		}else if (!variables.blocked){
			msg.reply("This voice channel's id is: '" + msg.member.voiceChannel.name + "'.");
		}
    msg.delete();
  }

  flipCommand(msg) {
    variables.generated_response = true;
		let outcome = ["heads", "tails"];
		if (!variables.blocked){
			msg.reply("You flipped " + outcome[this.getRandomInt(0, 1)] + ".");
		}
		msg.delete();
	}

  helpCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			msg.reply('**Bot Commands:**\n' + constants.cmdList);
		}
		msg.delete();
  }

  muteCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			if (this.voiceChannelBlacklistAdd(msg.member)){
				msg.reply('Sound commands muted on ' + msg.member.voiceChannel.name + " for " + Math.floor(constants.muteTime/60000) + " minutes.");
			}
		}
		msg.delete();
  }

  playmusicCommand(msg, arg1) {
    variables.generated_response = true;
		if (arg1 == '?' && !variables.blocked){
			msg.author.send("Song names:\n" + fs.readdirSync(constants.music_path).join().replace(/.mp3/g,"\n").replace(/,/g, ""), {split:true}).catch(err => this.logger(err));//if list is over 2000 characters, will complain in console, but works anyway.
		}else if (!this.voiceChannelIsBlacklisted(msg.member)){
			if (!msg.guild.voiceConnection){
				if (!variables.blocked){
					if (msg.member.voiceChannel == null){
						msg.author.send("**Invalid Command**");
						msg.author.send("You must be in a voice channel to play music.");
					}else if (arg1 == null){
						let len = fs.readdirSync(constants.music_path).length;
						this.playSound(msg.member, constants.music_path + "/" + fs.readdirSync(constants.music_path)[this.getRandomInt(1,len)-1]);
					}else{
						this.playSound(msg.member, constants.music_path + "/" + arg1 + '.mp3');
					}
				}
			}else{
				msg.delete();
				return;
			}
		}else{
			msg.author.send("**Blocked Command**");
			msg.author.send("Sound commands are not allowed on this voice channel, or it has been muted temporarily.");
		}
		msg.delete();
  }

  playsoundCommand(msg, arg1) {
    variables.generated_response = true;
		if (arg1 == '?' && !variables.blocked){
			msg.author.send("Sound names:\n" + fs.readdirSync(constants.sound_path).join().replace(/.mp3/g,"\n").replace(/,/g, ""), {split:true}).catch(err => this.logger(err));//if list is over 2000 characters, will complain in console, but works anyway.
		}else if (!this.voiceChannelIsBlacklisted(msg.member)){
			if (!msg.guild.voiceConnection){
				if (!variables.blocked){
					if (msg.member.voiceChannel == null){
						msg.author.send("**Invalid Command**");
						msg.author.send("You must be in a voice channel to play sounds.");
					}else if (arg1 == null){
						let len = fs.readdirSync(constants.sound_path).length;
						this.playSound(msg.member, constants.sound_path + "/" + fs.readdirSync('./sounds/')[this.getRandomInt(1,len)-1].replace(",", ""));
					}else{
						this.playSound(msg.member, constants.sound_path + "/" + arg1 + '.mp3');
					}
				}
			}else{
				msg.delete();
				return;
			}
		}else{
			msg.author.send("**Blocked Command**");
			msg.author.send("Sound commands are not allowed on this voice channel, or it has been muted temporarily.");
		}
		msg.delete();
  }

  playstreamCommand(msg, arg1) {
    variables.generated_response = true;
		if (!this.voiceChannelIsBlacklisted(msg.member)){
			if (!msg.guild.voiceConnection){
				if (!variables.blocked){
					if (msg.member.voiceChannel == null){
						msg.author.send("**Invalid Command**");
						msg.author.send("You must be in a voice channel to play audio stream.");
					}else if (arg1 == null){
						msg.author.send("Please provide a URL to a video/audio stream you wish to play.");
					}else{
						this.playStream(msg.member, arg1);
					}
				}
			}else{
				msg.delete();
				return;
			}
		}else{
				msg.author.send("**Blocked Command**");
				msg.author.send("Sound commands are not allowed on this voice channel, or it has been muted temporarily.");
		}
		msg.delete();
  }

  rollCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("You rolled a " + this.getRandomInt(1, 6));
		}
		msg.delete();
  }

  sayCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked && this.topClearance(msg.member)){
			this.logger("Said on command by " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			let custom_message = msg.content.slice(4);
			msg.channel.send(custom_message);
			msg.delete();
		}
  }

  serveridCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("This server's id is: " + msg.guild.id);
		}
    msg.delete();
  }

  stopCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			if (msg.guild.voiceConnection){
				msg.guild.voiceConnection.disconnect();
			}else{
				msg.author.send("**Invalid Command**");
				msg.author.send("No sound currently playing on server.");
			}
		}
		msg.delete();
  }

  unmuteCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			if (this.voiceChannelBlacklistRemove(msg.member)){
				msg.reply('Sound commands unmuted on ' + msg.member.voiceChannel.name + ".");
			}
		}
		msg.delete();
  }

  useridCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("Your universal user id is: " + msg.author.id);
		}
		msg.delete();
  }

  whodisCommand(msg) {
    variables.generated_response = true;
		if (!variables.blocked){
			msg.reply(constants.whodis_response);
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
  	recipient.send(constants.spamResponses[this.getRandomInt(1,10)]);
  }

  //media responses
  rFunnyResponse() {
  	return constants.rFunnyResponses[this.getRandomInt(1,8)];
  }

  imgurResponse() {
  	return constants.imgurResponses[this.getRandomInt(1,4)];
  }

  youtubeResponse() {
  	return constants.youtubeResponses[this.getRandomInt(1,4)];
  }

  //voice channel blacklist
  voiceChannelIsBlacklisted(member){
  	let currentDate = new Date();
  	if (member.voiceChannel == null) return false;
    let srvr = null;
  	for (srvr in variables.voiceChannelBlacklist){
  		if (member.guild.id == variables.voiceChannelBlacklist[srvr].server && member.voiceChannel.name == variables.voiceChannelBlacklist[srvr].channel){
  			if (variables.voiceChannelBlacklist[srvr].noExpire == true) return true;
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
  		member.send("Sound commands are already muted or blacklisted on this channel.");
  		return false;
  	}
  	let currentDate = new Date();
  	variables.voiceChannelBlacklist[variables.voiceChannelBlacklist.length] = {server:member.guild.id, channel:member.voiceChannel.name, expiration:new Date(currentDate.getTime() + constants.muteTime)};
  	return true;
  }

  voiceChannelBlacklistRemove(member){
  	if (!this.mediumClearance(member)){
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
  		if (variables.voiceChannelBlacklist[srvr].server == member.guild.id && variables.voiceChannelBlacklist[srvr].channel == member.voiceChannel.name && !variables.voiceChannelBlacklist[srvr].noExpire){
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
  topClearance(member) {
    let i = null;
  	for (i in variables.topClearanceList){
  		if (variables.topClearanceList[i].user == member.id && variables.topClearanceList[i].server == member.guild.id) return true;
  	}
  	return false;
  }

  mediumClearance(member) {
  	if (this.topClearance(member)) return true;
    let i = null;
  	for (i in variables.mediumClearanceList){
  		if (variables.mediumClearanceList[i].user == member.id && variables.mediumClearanceList[i].server == member.guild.id) return true;
  	}
  	return false;
  }

}

module.exports = functions;
