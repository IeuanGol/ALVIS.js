const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');
const WeatherUnderground = require('../Services/WeatherUnderground.js');

class Weather extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.wu = new WeatherUnderground(bot);
  }

  handle(message, response) {
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
