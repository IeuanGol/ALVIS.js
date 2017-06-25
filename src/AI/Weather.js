const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse.js');

class Weather extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    this.defaultHandler(message, response);
  }
}

module.exports = Weather;
