const Discord = require("discord.js");
var fs = require('fs');
const Cleverbot = require('cleverbot');
const ytdl = require('ytdl-core');
var funct = require("./functions.js");
let functions = new funct();

let bot = new Cleverbot({
	key: functions.getBotKeyConstant()
});

client = new Discord.Client();

function startBot() {
	functions.logger('Starting...');
	client.login(functions.getClientTokenConstant());
}

startBot();

client.on('ready', () => {
	functions.setBotNameVariable(client.user.username);
	functions.setBotUserIdVariable(client.user.id);
	functions.logger("Logged in to Discord as '" + functions.getBotNameVariable() + "'");
	client.user.setGame(functions.getClientGameConstant());
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
	if(msg.mentions.users[functions.getBotUserIdVariable()] != null && msg.mentions.users.length == 1) return;
	if(msg.channel instanceof Discord.DMChannel || msg.channel instanceof Discord.GroupDMChannel) return;
	if(!msg.content.startsWith(functions.getCommandPrefixConstant())) return;
	splitmessage = msg.content.split(" ");
	let command = splitmessage[0];
	command = command.slice(functions.getCommandPrefixConstant().length);
	let arg1 = splitmessage[1];
	let arg2 = splitmessage[2];
	let arg3 = splitmessage[3];

	if (command === 'channelid') {
		functions.channelidCommand(msg);

	}else if (command === 'flip') {
		functions.flipCommand(msg);

	}else if (command == 'help') {
		functions.helpCommand(msg);

	}else if (command === 'mute') {
		functions.muteCommand(msg);

	}else if (command === 'playmusic') {
		functions.playmusicCommand(msg, arg1);

	}else if (command === 'playsound') {
		functions.playsoundCommand(msg, arg1);

	}else if (command === 'playstream') {
		functions.playstreamCommand(msg, arg1);

	}else if (command === 'restart') {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
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

	}else if (command === 'roll') {
		functions.rollCommand(msg);

	}else if (command === 'say') {
		functions.sayCommand(msg);

	}else if (command === 'serverid') {
		functions.serveridCommand(msg);

	}else if (command === 'stop') {
		functions.stopCommand(msg);

	}else if (command === 'unmute') {
		functions.unmuteCommand(msg);

	}else if (command === 'userid') {
		functions.useridCommand(msg);

	}else if (command === 'whodis') {
		functions.whodisCommand(msg);
	}

	functions.commandLogger(msg, command);
});

//keyword response
client.on('message', msg => {
	functions.keywordVariablesSetup(msg);
	if(msg.content.startsWith(functions.getCommandPrefixConstant())) return;
	if(msg.author.bot) return;
	if(msg.isMentioned(functions.getBotUserIdVariable()) || msg.channel instanceof Discord.DMChannel) {
		if (functions.getSpamBlockedVariable()){
			functions.messageSpam(msg.author);
			if (msg.channel instanceof Discord.TextChannel) {
				functions.logger("Ignored mention from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam.");
			} else if (msg.channel instanceof Discord.DMChannel) {
				functions.logger("Ignored DM from " + msg.author.username + " due to spam.");
			}
			return;
		}
		if (functions.getBlacklistedVariable()){
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
		functions.setBlockedVariable(true);
		bot.query(msg.content.replace("<@" + functions.getBotUserIdVariable() + "> ", ""))
		.then(function (response) {
			msg.reply(response.output);
		});
		return;
	}
	if(msg.channel instanceof Discord.DMChannel || msg.channel instanceof Discord.GroupDMChannel) return;
	let rawcontent = msg.content.toLowerCase();

	if (rawcontent.includes('trump')) {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("You must know a lot about trucks!");
		}
	}

	if (rawcontent.includes('tachanka')) {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("**LMG MOUNTED AND LOADED!**");
		}
	}

	if (rawcontent == 'bing') {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("Bong!");
		}
	}

	if (rawcontent == 'nein') {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("Ja!");
		}
	}

	if (rawcontent.includes('adrian')) {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("I heard the name of my creator, Adrian! \nAnything I can do to help? \n\n*@mention or DM me to get my attention.*");
		}
	}

	if (rawcontent.includes(functions.getBotNameVariable().toLowerCase())) {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("I heard my name! \nAnything I can do to help? \n\n*@mention or DM me to get my attention.*");
		}
	}

	if (rawcontent.includes('packetcloud')) {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("I heard the name of my developer, PacketCloud! \nAnything I can do to help? \n\n*@mention or DM me to get my attention.*");
		}
	}

	if (rawcontent.includes('blitz')) {
		functions.setGeneratedResponseVariable(true);
		if (!functions.getBlockedVariable()){
			msg.reply("**#BuffBlitz2K17**");
		}
	}

	if (rawcontent.includes('reddit.com/r/funny/')) {
		if (!functions.getBlockedVariable()){
			if (functions.getRandomInt(1,2) == 1){
				msg.reply(functions.rFunnyResponse());
				functions.setGeneratedResponseVariable(true);
			}
		}
	}

	if (rawcontent.includes('imgur.com/')) {
		if (!functions.getBlockedVariable()){
			if (functions.getRandomInt(1,5) == 1){
				msg.reply(functions.imgurResponse());
				functions.setGeneratedResponseVariable(true);
			}
		}
	}

	if (rawcontent.includes('youtube.com/watch')) {
		if (!functions.getBlockedVariable()){
			if (functions.getRandomInt(1,5) == 1){
				msg.reply(functions.youtubeResponse());
				functions.setGeneratedResponseVariable(true);
			}
		}
	}

	functions.keywordLogger(msg);
});
