const Discord = require('discord.js');
const DefaultResponse = require('./DefaultResponse');

class Smalltalk extends DefaultResponse {
  constructor(bot) {
    super(bot);
  }

  handle(message, response) {
    message.reply(response.result.fulfillment.speech);
  }
}

module.exports = Smalltalk;
