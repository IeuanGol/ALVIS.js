const Discord = require('discord.js');

class ChatHandler {
  constructor(bot) {
    this.bot = bot;
  }

  handle(message) {
    if (message.content.startsWith(this.bot.basic.command_prefix)){
      return;
    }
    if (message.isMentioned(this.bot.basic.user_id)){
      this.bot.util.queryChatbotResponse(message);
      return;
    }
    const rawcontent = message.content.toLowerCase();
    if (rawcontent.includes(this.bot.config.bot_name.toLowerCase()) && !rawcontent.includes("\\" + this.bot.config.bot_name.toLowerCase()) && !rawcontent.includes("/" + this.bot.config.bot_name.toLowerCase())){
      var response = this.bot.responses.name_mention_response;
      message.reply(response);
      this.bot.util.logger("Responded to name mention from " + message.author.username + " on " + message.guild.name + ":" + message.channel.name);
      return;
    }
  }
}

module.exports = ChatHandler;
