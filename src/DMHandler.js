const Discord = require('discord.js');
const CommandExecuter = require('./CommandExecuter.js');

class DMHandler {
  constructor(bot) {
    this.bot = bot;
    this.commandExecuter = new CommandExecuter(bot);
  }

  handle(message) {
    if (message.content.startsWith(this.bot.basic.command_prefix)){
      this.dmCommandHandler(message);
      return;
    }
    this.bot.util.queryBotResponse(message);
  }

  dmCommandHandler(message){
    const splitmessage = message.content.split(" ");
    const command_prefix = this.bot.basic.command_prefix;
  	const command = splitmessage[0].slice(command_prefix.length).toLowerCase();;
    const body = message.content.substring(message.content.indexOf(" ") + 1);
  	const arg1 = splitmessage[1];
  	const arg2 = splitmessage[2];
  	const arg3 = splitmessage[3];
    var disallowed_command_message = "You cannot perform an **" + command_prefix + command + "** command from within a Direct Message.";

    if (command === "addsong"){
      message.reply(disallowed_command_message);
    }else if (command === "addsound"){
      message.reply(disallowed_command_message);
    }else if (command === "about"){
      this.commandExecuter.aboutCommand(message);
    }else if (command === "console"){
      message.reply(disallowed_command_message);
    }else if (command === "help"){
      this.commandExecuter.helpCommand(message);
    }else if (command === "playmusic" || command === "pm"){
      this.commandExecuter.playmusicCommand(message, arg1, arg2, body);
    }else if (command === "playsound" || command === "ps"){
      this.commandExecuter.playsoundCommand(message, arg1, arg2, body);
    }else if (command === "playstream"){
      message.reply(disallowed_command_message);
    }else if (command === "purgemusic"){
      message.reply(disallowed_command_message);
    }else if (command === "purgesounds"){
      message.reply(disallowed_command_message);
    }else if (command === "removesong"){
      message.reply(disallowed_command_message);
    }else if (command === "removesound"){
      message.reply(disallowed_command_message);
    }else if (command === "say"){
      message.reply(disallowed_command_message);
    }else if (command === "setbotgame"){
      message.reply(disallowed_command_message);
    }else if (command === "setbotstatus"){
      message.reply(disallowed_command_message);
    }else if (command === "showusersounds"){
      message.reply(disallowed_command_message);
    }else if (command === "songinfo"){
      message.reply(disallowed_command_message);
    }else if (command === "soundinfo"){
      message.reply(disallowed_command_message);
    }else if (command === "stop"){
      message.reply(disallowed_command_message);
    }else if (command === "updatemusic"){
        message.reply(disallowed_command_message);
    }else if (command === "updatesounds"){
        message.reply(disallowed_command_message);
    }else{
      message.author.send("Sorry. I do not recognize that command. Use **" + command_prefix + "help** for a list of commands.");
      this.bot.util.cleanupMessage(message);
    }
  }
}

module.exports = DMHandler;
