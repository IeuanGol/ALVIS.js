const Discord = require('discord.js');

class NewsAPI {
  constructor(bot) {
    this.bot = bot;
    this.apiKey = this.bot.config.news_api_key;
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
    if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 1, true);
    message.reply("I'm sorry, I cannot respond to that.\nThis feature is in mid-development. It is enabled for testing, but not fully-functioning at this time.")
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 1, true)});
    return;

    var discord_bot = this.bot;
    var category = response.result.parameters.category;
    var sort = response.result.parameters.sort;

    var request = require('request');

    if (!sort) sort = 'top';
    if (!category) category = 'general';

    var sources = this.getSourcesSubset(this.curated_sources[category], num_results);
    var length = sources.lenth;
    var baseURL = "https://newsapi.org/v1/articles?source=";

    if (category == "general") var topicDescription = "Here are some of the " + sort + " stories:";
    else if (category == "business") var topicDescription = "Here are the the " + sort + " stories in *business* news:";
    else if (category == "entertainment") var topicDescription = "Here are the " + sort + " stories in *entertainment*:"
    else if (category == "gaming") var topicDescription = "Here are the " + sort + " stories in *gaming* news:";
    else if (category == "music") var topicDescription = "Here are the " + sort + " stories in *music* news:";
    else if (category == "politics") var topicDescription = "Here are the " + sort + " stories in *politics*:";
    else if (category == "science-and-nature") var topicDescription = "Here are the " + sort + " in *science and nature*:";
    else if (category == "sport") var topicDescription = "Here are the " + sort + " stories in *sports* news:";
    else if (category == "technology") var topicDescription = "Here are the " + sort + " stories in *tech*:";
    else var topicDescription = "Here are the " + sort + " stories in *" + category + "*:";

    message.reply(topicDescription)
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 5, true)});
    if (message.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(message, 5, true);
    for (var i = 0; i < length; i++){
      var source = sources[i];
      var requestURL = baseURL + source + "&sortBy=" + sort + "&apiKey=" + this.apiKey;
      request(requestURL, function(error, response, body){
        var sourceData = JSON.parse(body);
        if (sourceData.status != "ok"){
          var embed = new RichEmbed();
          embed.setTitle("Error Loading Article");
          embed.setDescription("I could not load this article from `" + source + "`.");
          message.channel.send("", {"embed": embed});
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 5, true)});
        }else{
          var article = sourceData.articles[discord_bot.util.getRandomInt(0, sourceData.articles.length - 1)];
          var embed = new RichEmbed();
          embed.setTitle(article.title);
          embed.setDescription(article.description);
          embed.setURL(article.url);
          embed.setThumbnail(article.urlToImage);
          embed.setFooter("Result courtesy of News API | ©2017 News API | " + article.publishedAt, "https://newsapi.org/images/newsapi-logo.png");
          embed.setColor(parseInt(discord_bot.colours.news_api_embed_colour));
          message.channel.send("", {"embed": embed});
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 5, true)});
        }
      });
    }
  }

  getSourcesSubset(collection, num_results) {
    var collectionLength = collection.length;
    var queue = Array.from(collection);
    var duplicate_sources = 0;
    var subset = [];
    if (length < num_results){
      duplicate_sources = num_results - collectionLength;
    }
    for (var i = 0; i < num_results; i++){
      var len = queue.length;
      var index = this.bot.util.getRandomInt(0, len - 1);
      var source = queue[index];
      subset.push(source);
      if (duplicate_sources < 1){
        queue.splice(index, 1);
      }else{
        duplicate_source -= 1;
      }
    }
    return subset;
  }
}

module.exports = NewsAPI;
