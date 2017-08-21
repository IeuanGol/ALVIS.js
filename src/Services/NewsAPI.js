const Discord = require('discord.js');

class NewsAPI {
  constructor(bot) {
    this.bot = bot;
  }

  sendSearchResultsFromResponse(message, response, num_results) {
    var discord_bot = this.bot;
    if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
    message.reply("I'm sorry, I cannot respond to that.\nThis feature is in mid-development. It is enabled for testing, but not fully-functioning at this time.")
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
  }
}

module.exports = NewsAPI;
