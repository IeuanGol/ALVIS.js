const Discord = require('discord.js');

class DefaultResponse {
  constructor(bot){
    this.bot = bot;
    this.util = this.bot.util;
  }

  handle(message, response){
    if (response.result.fulfillment.speech !== ""){
      message.reply(response.result.fulfillment.speech);
    }else{
      this.bot.util.logger("Default Query Response was unable to handle query from " + message.author.username);
    }
  }
}

module.exports = DefaultResponse;
