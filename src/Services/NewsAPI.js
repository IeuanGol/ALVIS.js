const Discord = require('discord.js');

class NewsAPI {
  constructor(bot) {
    this.bot = bot;

    this.curated_sources = {
      "general": [
        "associated-press",
        "bbc-news",
        "cnn",
        "google-news",
        "independent",
        "newsweek",
        "reddit-r-all",
        "the-huffington-post",
        "the-new-york-times",
        "the-telegraph",
        "time",
        "usa-today"
      ],
      "business": [
        "bloomberg",
        "business-insider",
        "fortune",
        "the-economist",
        "the-wall-street-journal"
      ],
      "entertainment": [
        "buzzfeed",
        "daily-mail",
        "entertainment-weekly",
        "mashable"
      ],
      "gaming": [
        "ign",
        "polygon"
      ],
      "music": [
        "mtv-news",
        "mtv-news-uk"
      ],
      "politics": [
        "breitbart-news"
      ],
      "science-and-nature": [
        "national-geographic",
        "new-scientist"
      ],
      "sport": [
        "bbc-sport",
        "espn",
        "fox-sports",
        "nfl-news"
      ],
      "technology": [
        "ars-technica",
        "engadget",
        "hacker-news",
        "techcrunch",
        "techradar",
        "the-next-web",
        "the-verge"
      ]
    }
  }

  sendSearchResultsFromResponse(message, response, num_results) {
    var discord_bot = this.bot;
    var category = response.result.parameters.category;
    var sort = response.result.parameters.sort;
    if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
    message.reply("I'm sorry, I cannot respond to that.\nThis feature is in mid-development. It is enabled for testing, but not fully-functioning at this time.")
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
  }
}

module.exports = NewsAPI;
