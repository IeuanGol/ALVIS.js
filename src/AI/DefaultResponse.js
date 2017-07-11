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
    var discord_bot = this.bot;
    if (response.result.fulfillment.speech !== ""){
      message.reply(response.result.fulfillment.speech);
    }else{
      if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true)
      message.reply("I am unable to respond to your `" + response.result.action + "` query at this time. Perhaps this feature is still in development.")
      .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
      this.bot.util.logger("Default Query Response was unable to handle " + response.result.action + " query from " + message.author.username);
    }
  }
}

module.exports = DefaultResponse;
