const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const WeatherUnderground = require('../Services/WeatherUnderground.js');

class Weather extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.service = "WeatherUnderground";
    if (this.bot.basic.services[this.service].active){
      this.wu = new WeatherUnderground(bot);
    }
  }

  handle(message, response) {
    if (!this.bot.basic.services[this.service].active){
      this.disabledServiceHandler(message, this.service);
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
    if (actionType == null){
      this.wu.sendConditions(message, null, response.result.parameters.address, response.result.parameters.country);
    }else if (actionType == "conditions"){
      this.wu.sendConditions(message, null, response.result.parameters.address, response.result.parameters.country);
    }else if (actionType == "forecast"){
      this.defaultHandler(message, response);
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = Weather;
