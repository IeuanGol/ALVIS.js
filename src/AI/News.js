const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const News = require('./News.js');

class News extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.service = "NewsAPI";
    if (this.bot.basic.services[this.service].active){
      this.news = new News(bot);
    }
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

  handle(message, response) {
    if (!this.bot.basic.services[this.service].active){
      this.disabledServiceHandler(message, response, this.service);
      return;
    }
    var discord_bot = this.bot;
    var action = response.result.action;
    if (action.split(".")[1]){
      var actionType = action.split(".")[1];
    }else{
      var actionType = null;
    }
    var handler = this;
    if (actionType == "search"){
      this.news.sendSearchResultsFromResponse(message, response, 5);
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = News;
