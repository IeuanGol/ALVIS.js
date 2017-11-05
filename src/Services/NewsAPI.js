const Discord = require('discord.js');

class NewsAPI {
  constructor(bot) {
    this.bot = bot;
    this.apiKey = this.bot.config.news_api_key;
    this.curated_sources = {
      "general": [
        {"id": "associated-press", "name": "Associated Press", "icon": "", "url": ""},
        {"id": "bbc-news", "name": "BBC News", "icon": "", "url": ""},
        {"id": "cnn", "name": "CNN", "icon": "", "url": ""},
        {"id": "google-news", "name": "Google News", "icon": "", "url": ""},
        {"id": "independent", "name": "Independent", "icon": "", "url": ""},
        {"id": "newsweek", "name": "Newsweek", "icon": "", "url": ""},
        {"id": "reddit-r-all", "name": "Reddit r/all", "icon": "", "url": ""},
        {"id": "the-huffington-post", "name": "The Huffington Post", "icon": "", "url": ""},
        {"id": "the-new-york-times", "name": "The New York Times", "icon": "", "url": ""},
        {"id": "the-telegraph", "name": "The Telegraph", "icon": "", "url": ""},
        {"id": "time", "name": "Time", "icon": "", "url": ""},
        {"id": "usa-today", "name": "USA Today", "icon": "", "url": ""}
      ],
      "business": [
        {"id": "bloomberg", "name": "Bloomberg", "icon": "", "url": ""},
        {"id": "business-insider", "name": "Business Insider", "icon": "", "url": ""},
        {"id": "fortune", "name": "Fortune", "icon": "", "url": ""},
        {"id": "the-economist", "name": "The Economist", "icon": "", "url": ""},
        {"id": "the-wall-street-journal", "name": "The Wall Street Journal", "icon": "", "url": ""}
      ],
      "entertainment": [
        {"id": "buzzfeed", "name": "Buzzfeed", "icon": "", "url": ""},
        {"id": "daily-mail", "name": "Daily Mail", "icon": "", "url": ""},
        {"id": "entertainment-weekly", "name": "Entertainment Weekly", "icon": "", "url": ""},
        {"id": "mashable", "name": "Mashable", "icon": "", "url": ""}
      ],
      "gaming": [
        {"id": "ign", "name": "IGN", "icon": "", "url": ""},
        {"id": "polygon", "name": "Polygon", "icon": "", "url": ""}
      ],
      "music": [
        {"id": "mtv-news", "name": "MTV News", "icon": "", "url": ""},
        {"id": "mtv-news-uk", "name": "MTV News (UK)", "icon": "", "url": ""}
      ],
      "politics": [
        {"id": "breitbart-news", "name": "Breitbart News", "icon": "", "url": ""}
      ],
      "science-and-nature": [
        {"id": "national-geographic", "name": "National Geographic", "icon": "", "url": ""},
        {"id": "new-scientist", "name": "New Scientist", "icon": "", "url": ""}
      ],
      "sport": [
        {"id": "bbc-sport", "name": "BBC Sport", "icon": "", "url": ""},
        {"id": "espn", "name": "ESPN", "icon": "", "url": ""},
        {"id": "fox-sports", "name": "Fox Sports", "icon": "", "url": ""},
        {"id": "nfl-news", "name": "NFL News", "icon": "", "url": ""}
      ],
      "technology": [
        {"id": "ars-technica", "name": "Ars Technica", "icon": "", "url": ""},
        {"id": "engadget", "name": "Engadget", "icon": "", "url": ""},
        {"id": "hacker-news", "name": "Hacker News", "icon": "", "url": ""},
        {"id": "techcrunch", "name": "TechCrunch", "icon": "", "url": ""},
        {"id": "techradar", "name": "TechRadar", "icon": "", "url": ""},
        {"id": "the-next-web", "name": "The Next Web", "icon": "", "url": ""},
        {"id": "the-verge", "name": "The Verge", "icon": "", "url": ""}
      ]
    }
  }

  sendSearchResultsFromResponse(message, response, num_results) {
    var discord_bot = this.bot;
    var handler = this;
    var category = response.result.parameters.category;
    var sort = response.result.parameters.sort;

    var request = require('request');

    if (!sort) sort = 'top';
    if (!category) category = 'general';

    var sources = Array.from(this.getSourcesSubset(this.curated_sources[category], num_results));
    var length = sources.length;
    var baseURL = "https://newsapi.org/v1/articles?source=";

    if (category == "general") var topicDescription = "Here are some of the " + sort + " stories:";
    else if (category == "business") var topicDescription = "Here are the the " + sort + " stories in *business* news:";
    else if (category == "entertainment") var topicDescription = "Here are the " + sort + " stories in *entertainment*:"
    else if (category == "gaming") var topicDescription = "Here are the " + sort + " stories in *gaming* news:";
    else if (category == "music") var topicDescription = "Here are the " + sort + " stories in *music* news:";
    else if (category == "politics") var topicDescription = "Here are the " + sort + " stories in *politics*:";
    else if (category == "science-and-nature") var topicDescription = "Here are the " + sort + " stories in *science and nature*:";
    else if (category == "sport") var topicDescription = "Here are the " + sort + " stories in *sports* news:";
    else if (category == "technology") var topicDescription = "Here are the " + sort + " stories in *tech*:";
    else var topicDescription = "Here are the " + sort + " stories in *" + category + "*:";

    message.reply(topicDescription)
    .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 5, false)});
    for (var i = 0; i < length; i++){
      var source = sources[i];
      var requestURL = baseURL + source.id + "&sortBy=" + sort + "&apiKey=" + this.apiKey;
      request(requestURL, function(error, response, body){
        var sourceData = JSON.parse(body);
        if (sourceData.status != "ok"){
          var embed = new Discord.RichEmbed();
          embed.setTitle("Error Loading Article");
          embed.setDescription("I was unable to load this article.\nThe source website returned an invalid response.");
          message.channel.send("", {"embed": embed})
          .then((msg) => {if (msg.channel instanceof Discord.TextChannel) discord_bot.messageCleanupQueue.add(msg, 5, true)});
        }else{
          var article = sourceData.articles[discord_bot.util.getRandomInt(0, sourceData.articles.length - 1)];
          var localSource = handler.getSourceFromID(sourceData.source, category);
          var embed = new Discord.RichEmbed();
          embed.setTitle(article.title);
          embed.setDescription(article.description);
          embed.setURL(article.url);
          embed.setThumbnail(article.urlToImage);
          embed.setAuthor(localSource.name, localSource.icon, localSource.icon);
          embed.setFooter("Result courtesy of News API | ©2017 News API", "https://newsapi.org/images/newsapi-logo.png");
          embed.setColor(parseInt(discord_bot.colours.news_api_embed_colour));
          message.channel.send("", {"embed": embed})
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
    if (collectionLength < num_results){
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
        duplicate_sources -= 1;
      }
    }
    return subset;
  }

  getSourceFromID(id, category) {
    var sources = Array.from(this.curated_sources[category]);
    for (var i = 0; i < sources.length; i++){
      if (sources[i].id == id){
        return sources[i];
      }
    }
    return {"id": "", "name": "", "icon": "", "url": ""};
  }
}

module.exports = NewsAPI;
