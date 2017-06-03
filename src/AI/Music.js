const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class Music extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    this.defaultHandler(message, response);
  }
}

module.exports = Music;
