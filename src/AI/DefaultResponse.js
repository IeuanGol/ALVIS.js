const Discord = require('discord.js');

class DefaultResponse {
  constructor(bot){
    this.bot = bot;
    this.util = this.bot.util;
  }

  handle(message, response) {
    this.defaultHandler(message, response);
  }

  defaultHandler(message, response) {
    if (response.result.fulfillment.speech !== ""){
      message.reply(response.result.fulfillment.speech);
    }else{
      message.reply("I am unable to respond to your `" + response.result.action + "` query at this time. Perhaps this feature is still in development.");
      this.bot.util.logger("Default Query Response was unable to handle " + response.result.action + " query from " + message.author.username);
    }
  }
}

module.exports = DefaultResponse;
