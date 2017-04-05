const Discord = require("discord.js");
var fs = require('fs');
const Cleverbot = require('cleverbot');
const ytdl = require('ytdl-core');
var funct = require("./functions.js");
let functions = new funct();
var constants = require("./constants.js");
var variables = require("./variables.js");
var timeLog = require("./timeLog.js");

let bot = new Cleverbot({
	key: constants.bot_key
});

client = new Discord.Client();

function startBot() {
	functions.logger('Starting...');
	client.login(constants.client_token);
}

startBot();

client.on('ready', () => {
	variables.bot_name = client.user.username;
	variables.bot_user_id = client.user.id;
	functions.logger("Logged in to Discord as '" + variables.bot_name + "'");
	client.user.setGame(constants.client_game);
});

client.on('disconnect', () => {
	functions.logger('Bot disconnected from Discord\n');
});

client.on('reconnecting', () => {
	functions.logger('AutoReconnecting...');
});

//command response
client.on('message', msg => {
	functions.commandVariablesSetup(msg);
	if(msg.author.bot) return;
	if(msg.mentions.users[variables.bot_user_id] != null && msg.mentions.users.length == 1) return;
	if(msg.channel instanceof Discord.DMChannel || msg.channel instanceof Discord.GroupDMChannel) return;
	if(!msg.content.startsWith(constants.command_prefix)) return;
	splitmessage = msg.content.split(" ");
	let command = splitmessage[0];
	command = command.slice(constants.command_prefix.length);
	let arg1 = splitmessage[1];
	let arg2 = splitmessage[2];
	let arg3 = splitmessage[3];

	if (command == 'help') {
		functions.helpCommand(msg);

	}else if (command === 'restart') {
		variables.generated_response = true;
		if (!variables.blocked){
			if (functions.mediumClearance(msg.member)){
				functions.logger('User ' + msg.author.username + ' requested restart on ' + msg.guild.name + ':' + msg.channel.name);
				msg.delete();
				client.destroy();
				startBot();
				return;
			}else{
				functions.logger('Denied requested restart by ' + msg.author.name + ' on ' + msg.guild.name + ':' + msg.channel.name + ' due to insufficient privilege');
				msg.author.send("**Blocked Command**");
				msg.author.send("You do not have permission to use this command.");
				return;
			}
		}
		msg.delete();

	}else if (command === 'stop') {
		functions.stopCommand(msg);

	}else if (command === 'mute') {
		functions.muteCommand(msg);

	}else if (command === 'unmute') {
		functions.unmuteCommand(msg);

	}else if (command === 'whodis') {
		functions.whodisCommand(msg);

	}else if (command === 'playsound') {
		functions.playsoundCommand(msg, arg1);

	}else if (command === 'playmusic') {
		functions.playmusicCommand(msg, arg1);

	}else if (command === 'playstream') {
		functions.playstreamCommand(msg, arg1);

	}else if (command === 'serverid') {
		functions.serveridCommand(msg);

	}else if (command === 'userid') {
		functions.useridCommand(msg);

	}else if (command === 'say') {
		functions.sayCommand(msg);

	}else if (command === 'channelid') {
		functions.channelidCommand(msg);

	}else if (command === 'roll') {
		functions.rollCommand(msg);

	}else if (command === 'flip') {
		functions.flipCommand(msg);
	}

	functions.commandLogger(msg, command);
});

//keyword response
client.on('message', msg => {
	functions.keywordVariablesSetup(msg);
	if(msg.author.bot) return;
	if(msg.isMentioned(variables.bot_user_id) || msg.channel instanceof Discord.DMChannel) {
		if (variables.spamBlocked){
			messageSpam(msg.author);
			if (msg.channel instanceof Discord.TextChannel) {
				functions.logger("Ignored mention from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam.");
			} else if (msg.channel instanceof Discord.DMChannel) {
				functions.logger("Ignored DM from " + msg.author.username + " due to spam.");
			}
			return;
		}
		if (variables.blacklisted){
			messageBlacklisted(msg.author);
			if (msg.channel instanceof Discord.TextChannel) {
				functions.logger("Ignored mention from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to blacklist.");
			} else if (msg.channel instanceof Discord.DMChannel) {
				functions.logger("Ignored DM from " + msg.author.username + " due to blacklist.");
			}
			return;
		}
		if (msg.channel instanceof Discord.DMChannel){
			functions.logger("Replied to DM from " + msg.author.username);
		}else {
			functions.logger("Replied to mention from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}
		variables.blocked = true;
		bot.query(msg.content.replace("<@" + variables.bot_user_id + "> ", ""))
		.then(function (response) {
			msg.reply(response.output);
		});
		return;
	}
	if(msg.channel instanceof Discord.DMChannel || msg.channel instanceof Discord.GroupDMChannel) return;
	let rawcontent = msg.content.toLowerCase();

	if (rawcontent.includes('trump')) {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("You must know a lot about trucks!");
		}
	}

	if (rawcontent.includes('tachanka')) {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("**LMG MOUNTED AND LOADED!**");
		}
	}

	if (rawcontent == 'bing') {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("Bong!");
		}
	}

	if (rawcontent == 'nein') {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("Ja!");
		}
	}

	if (rawcontent.includes('adrian')) {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("I heard my creator's name! \nAnything I can do to help? \n\n*@mention or DM me to get my attention.*");
		}
	}

	if (rawcontent.includes(variables.bot_name.toLowerCase())) {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("I heard my name! \nAnything I can do to help? \n\n*@mention or DM me to get my attention.*");
		}
	}

	if (rawcontent.includes('blitz')) {
		variables.generated_response = true;
		if (!variables.blocked){
			msg.reply("**#BuffBlitz2K17**");
		}
	}

	if (rawcontent.includes('reddit.com/r/funny/')) {
		if (!variables.blocked){
			if (functions.getRandomInt(1,2) == 1){
				msg.reply(functions.rFunnyResponse());
				variables.generated_response = true;
			}
		}
	}

	if (rawcontent.includes('imgur.com/')) {
		if (!variables.blocked){
			if (functions.getRandomInt(1,5) == 1){
				msg.reply(functions.imgurResponse());
				variables.generated_response = true;
			}
		}
	}

	if (rawcontent.includes('youtube.com/watch')) {
		if (!variables.blocked){
			if (functions.getRandomInt(1,5) == 1){
				msg.reply(functions.youtubeResponse());
				variables.generated_response = true;
			}
		}
	}

	functions.keywordLogger(msg);
});
