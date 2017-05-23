const Discord = require('discord.js');
const CommandExecuter = require('./CommandExecuter.js');

class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.commandExecuter = new CommandExecuter(this.bot);
  }

  handle(message) {
    if (!message.content.startsWith(this.bot.basic.command_prefix)){
      return;
    }
    const splitmessage = message.content.split(" ");
  	const command = splitmessage[0].slice(this.bot.basic.command_prefix.length).toLowerCase();;
  	const arg1 = splitmessage[1];
  	const arg2 = splitmessage[2];
  	const arg3 = splitmessage[3];

    if (command === "addallmusic"){
      this.commandExecuter.addallmusicCommand(message);
    }else if (command === "addallsounds"){
      this.commandExecuter.addallsoundsCommand(message);
    }else if (command === "addmusic"){
      this.commandExecuter.addmusicCommand(message, arg1, arg2);
    }else if (command === "addsound"){
      this.commandExecuter.addsoundCommand(message, arg1, arg2);
    }else if (command === "about"){
      this.commandExecuter.aboutCommand(message);
    }else if (command === "flip"){
      this.commandExecuter.flipCommand(message);
    }else if (command === "help"){
      this.commandExecuter.helpCommand(message);
    }else if (command === "playmusic"){
      this.commandExecuter.playmusicCommand(message, arg1, arg2);
    }else if (command === "playsound"){
      this.commandExecuter.playsoundCommand(message, arg1, arg2);
    }else if (command === "playstream"){
      this.commandExecuter.playstreamCommand(message, arg1);
    }else if (command === "purgemusic"){
      this.commandExecuter.purgemusicCommand(message);
    }else if (command === "purgesounds"){
      this.commandExecuter.purgesoundsCommand(message);
    }else if (command === "removemusic"){
      this.commandExecuter.removemusicCommand(message, arg1);
    }else if (command === "removesound"){
      this.commandExecuter.removesoundCommand(message, arg1);
    }else if (command === "roll"){
      this.commandExecuter.rollCommand(message, arg1);
    }else if (command === "say"){
      bot.commandExecuter.sayCommand(message);
    }else if (command === "stop"){
      this.commandExecuter.stopCommand(message);
    }
  }
}

module.exports = CommandHandler;
