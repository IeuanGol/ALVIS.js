const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class Translate extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    message.reply("I am unable to answer translation queries at this time.\n\nThis feature is still in development.");
  }
}

module.exports = Translate;
