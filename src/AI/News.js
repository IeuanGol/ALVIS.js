const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const NewsAPI = require('../Services/NewsAPI.js');

class News extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.service = "NewsAPI";
    if (this.bot.basic.services[this.service].active){
      this.newsAPI = new NewsAPI(bot);
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
      this.newsAPI.sendSearchResultsFromResponse(message, response, 5);
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = News;
