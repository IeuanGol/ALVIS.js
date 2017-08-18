const Discord = require('discord.js');

class NewsAPI {
  constructor(bot) {
    this.bot = bot;
  }

  sendSearchResultsFromResponse(message, response, num_results) {
    var discord_bot = this.bot;
    message.reply("This feature is in mid-development; enabled for testing, but not fully-functioning.")
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
  }
}
