const Discord = require('discord.js');

class DMHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(message) {
    if (message.content.startsWith(this.bot.basic.command_prefix)){
      this.dmCommandHandler(message);
      return;
    }
    this.bot.util.queryBotResponse(message);
  }

  dmCommandHandler(message){
    return;//Currently no commands designated for DM channels
  }
}

module.exports = DMHandler;
