const Discord = require('discord.js');
const WolframService = require('../Services/Wolfram.js');
const DefaultResponse = require('./DefaultResponse');

class Wolfram extends DefaultResponse {
  constructor(bot) {
    super(bot);
    this.wolframService = new WolframService(this.bot);
  }

  handle(message, response) {
    var action = response.result.action;
    var actionType = action.split(".")[1];
    if (actionType == "topic_search"){
      this.wolframService.sendWolframResponse(message, response, "I found this for you:\n\n", false, true);
    }else if (actionType == "resolve_equation"){
      this.wolframService.sendWolframResponse(message, response, "Here you go:\n\n", false, false);
    }else{
      this.defaultHandler(message, response);
    }
  }
}

module.exports = Wolfram;
