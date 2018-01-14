const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');

class ConsoleCommand extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    var discord_bot = this.bot;
    var action = response.result.action;
    var actionType = action.split(".")[1];
    if (actionType == "shutdown"){
      message.reply("Attempting shutdown...");
      this.bot.commandHandler.commandExecuter.consoleCommand(message, "sudo shutdown", true);
    }else if (actionType == "restart"){
      message.reply("Attempting restart...");
      this.bot.commandHandler.commandExecuter.consoleCommand(message, "sudo restart", true);
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = ConsoleCommand;
