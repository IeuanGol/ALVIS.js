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
	command = command.slice(functions.getCommandPrefixConstant().length).toLowerCase();
	let arg1 = splitmessage[1];
	let arg2 = splitmessage[2];
	let arg3 = splitmessage[3];

	switch(command) {
		case 'about':
			functions.aboutCommand(msg, command);
			break;

		case 'channelid':
			functions.channelidCommand(msg, command);
			break;

		case 'displaylogs':
			functions.displaylogsCommand(msg, command);
			break;

		case 'flip':
			functions.flipCommand(msg, command);
			break;

		case 'help':
			functions.helpCommand(msg, command);
			break;

		case 'mute':
			functions.muteCommand(msg, command);
			break;

		case 'playmusic':
			functions.playmusicCommand(msg, arg1, command);
			break;

		case 'playsound':
			functions.playsoundCommand(msg, arg1, command);
			break;

		case 'playstream':
			functions.playstreamCommand(msg, arg1, command);
			break;

		case 'restart':
			if (!functions.getBlockedVariable()){
				if (functions.isAdmin(msg.member)){
					functions.logger('User ' + msg.author.username + ' requested restart on ' + msg.guild.name + ':' + msg.channel.name);
					msg.delete();
					client.destroy();
					startBot();
					return;
				}else{
					msg.author.send("**Blocked Command**");
					msg.author.send("You do not have permission to use this command.");
					functions.logger('Denied requested restart by ' + msg.author.name + ' on ' + msg.guild.name + ':' + msg.channel.name + ' due to insufficient privileges');
					return;
				}
			}
			msg.delete();
			break;

		case 'roll':
			functions.rollCommand(msg, arg1, command);
			break;

		case 'say':
			functions.sayCommand(msg, command);
			break;

		case 'serverid':
			functions.serveridCommand(msg, command);
			break;

		case 'stop':
			functions.stopCommand(msg, command);
			break;

		case 'stopdisplaylogs':
			functions.stopdisplaylogsCommand(msg, command);
			break;

		case 'unmute':
			functions.unmuteCommand(msg, command);
			break;
	}

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
		bot.query(msg.cleanContent.replace(functions.getBotNameVariable(), "").replace(/@/g, ""))
		.then(function (response) {
			msg.reply(response.output);
		});
		return;
	}
	if(msg.channel instanceof Discord.DMChannel || msg.channel instanceof Discord.GroupDMChannel) return;
	let rawcontent = msg.content.toLowerCase();

	if (rawcontent.includes('tachanka')) {
		if (!functions.getBlockedVariable()){
			msg.reply("**LMG MOUNTED AND LOADED!**");
			functions.logger("Responded to 'tachanka' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'tachanka' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent == 'bing') {
		if (!functions.getBlockedVariable()){
			msg.reply("Bong!");
			functions.logger("Responded to 'bing' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'bing' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent == 'ping') {
		if (!functions.getBlockedVariable()){
			msg.reply("Pong!");
			functions.logger("Responded to 'ping' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'ping' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent == 'nein') {
		if (!functions.getBlockedVariable()){
			msg.reply("Ja!");
			functions.logger("Responded to 'nein' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'nein' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent.includes(functions.getBotNameVariable().toLowerCase())) {
		if (!functions.getBlockedVariable()){
			msg.reply("I heard my name! \nAnything I can do to help? \n\n*@mention or DM me to get my attention.*");
			functions.logger("Responded to name mention from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored name mention from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent.includes('blitz')) {
		if (!functions.getBlockedVariable()){
			msg.reply("**#BuffBlitz2K17**");
			functions.logger("Responded to 'blitz' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'blitz' keyword from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent.includes('reddit.com/r/funny/')) {
		if (!functions.getBlockedVariable()){
			if (functions.getRandomInt(1, 10) == 1){
				msg.reply(functions.rFunnyResponse());
				functions.logger("Responded to 'reddit.com/r/funny/' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
				functions.logger("Ignored 'reddit.com/r/funny/' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'reddit.com/r/funny/' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent.includes('imgur.com/')) {
		if (!functions.getBlockedVariable()){
			if (functions.getRandomInt(1, 10) == 1){
				msg.reply(functions.imgurResponse());
				functions.logger("Responded to 'imgur.com/' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
				functions.logger("Ignored 'imgur.com/' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'imgur.com/' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

	if (rawcontent.includes('youtube.com/watch')) {
		if (!functions.getBlockedVariable()){
			if (functions.getRandomInt(1, 10) == 1){
				msg.reply(functions.youtubeResponse());
				functions.logger("Responded to 'youtube.com/watch' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}else{
				functions.logger("Ignored 'youtube.com/watch' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name);
			}
		}else{
			if (functions.getSpamBlockedVariable()){
				functions.logger("Ignored 'youtube.com/watch' link from " + msg.author.username + " on " + msg.guild.name + ":" + msg.channel.name + " due to spam");
			}
		}
	}

});
